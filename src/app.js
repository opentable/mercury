'use strict';

const async = require('async');
const Manifest = require('./manifest');
const Resources = require('./resources');
const Translations = require('./translations');

module.exports = ({ config, loggerService }) => {
  const manifest = Manifest(loggerService);
  const resources = Resources(loggerService);
  const translations = Translations(loggerService);

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
        loggerService.info(`Attempted processing ${repository.owner}/${repository.repo} with errors`, 'repo-skipped');
      } else {
        loggerService.info(`Completed processing ${repository.owner}/${repository.repo} without errors`, 'repo-completed');
      }

      next();
    });
  };

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
        loggerService.info(`Completed running`, 'run-completed');
        process.exit(0);
      });
    }
  );
};
