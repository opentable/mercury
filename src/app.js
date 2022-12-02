'use strict';

const async = require('async');
const EventEmitter = require('events');
const Manifest = require('./manifest');
const Resources = require('./resources');
const Translations = require('./translations');

const validateConfig = ({ bucketsCount }) => {
  const isValidBucketsCountConfig = !bucketsCount || (Number.isInteger(bucketsCount) && bucketsCount >= 1 && bucketsCount <= 24);
  if (!isValidBucketsCountConfig) {
    throw new Error('"bucketsCount" value must be an integer between 1 and 24');
  }
};

module.exports = ({ config }) => {
  validateConfig(config);

  const emitter = new EventEmitter();
  const manifest = Manifest({ emitter, config });
  const resources = Resources({ emitter, config });
  const translations = Translations({ emitter, config });

  const processRepo = (repository, next) => {
    const mercury = async.seq(
      manifest.fetch,
      manifest.validate,
      translations.getList,
      translations.getProjectInfo,
      translations.upload,
      translations.fetchAll,
      translations.getStatus,
      resources.fetchAll,
      resources.ensureFork,
      resources.fetchPullRequestInfo,
      resources.closePullRequestIfOutdated,
      resources.deleteReferenceIfClosedPr,
      resources.ensureBranch,
      resources.commitFiles,
      resources.handlePullRequest
    );

    mercury(repository, (err, repository) => {
      if (err) {
        emitter.emit('result', {
          resultType: 'repo-skipped',
          message: `Attempted processing ${repository.owner}/${repository.repo} with errors`
        });
      } else {
        emitter.emit('result', {
          resultType: 'repo-completed',
          message: `Completed processing ${repository.owner}/${repository.repo} without errors`
        });
      }

      next();
    });
  };

  return {
    on: (eventType, cb) => emitter.on(eventType, cb),
    run: done => {
      const currentHour = new Date().getUTCHours();
      const bucketsCount = config.bucketsCount || 1;
      const currentBucketNumber = currentHour % bucketsCount;

      async.eachOfSeries(
        config.repositories,
        (repositories, owner, next) => {
          async.eachOfSeries(
            repositories,
            (repo, repoIndex, next) => {
              if (currentBucketNumber === repoIndex % bucketsCount) {
                processRepo({ owner, repo }, next);
              } else {
                next();
              }
            },
            next
          );
        },
        () => {
          resources.fetchRequestRateStats(() => {
            emitter.emit('result', {
              resultType: 'run-completed',
              message: `Completed running`
            });
            done();
          });
        }
      );
    }
  };
};
