'use strict';

const async = require('async');
const EventEmitter = require('events');
const Manifest = require('./manifest');
const Resources = require('./resources');
const Translations = require('./translations');

module.exports = ({ config }) => {
  const emitter = new EventEmitter();
  const manifest = Manifest(emitter);
  const resources = Resources(emitter);
  const translations = Translations(emitter);

  const processRepo = (repository, next) => {
    const mercury = async.seq(
      manifest.fetch,
      manifest.validate,
      translations.getList,
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
        emitter.emit('result', { resultType: 'repo-skipped', message: `Attempted processing ${repository.owner}/${repository.repo} with errors` });
      } else {
        emitter.emit('result', { resultType: 'repo-completed', message: `Completed processing ${repository.owner}/${repository.repo} without errors` });
      }

      next();
    });
  };

  return {
    on: (eventType, cb) => emitter.on(eventType, cb),
    run: done => {
      async.eachOfSeries(
        config.repositories,
        (repositories, owner, next) => {
          async.eachSeries(
            repositories,
            (repo, next) => {
              processRepo({ owner, repo }, next);
            },
            next
          );
        },
        () => {
          resources.fetchRequestRateStats(() => {
            emitter.emit('result', { resultType: 'run-completed', message: `Completed running` });
            done();
          });
        }
      );
    }
  };
};
