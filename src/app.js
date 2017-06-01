'use strict';

const async         = require('async');
const config        = require('config');
const errorTypes    = require('./constants/error-types');
const Logger        = require('./services/logger-service');
const loggerService = Logger();
const manifest      = require('./manifest');
const resources     = require('./resources');
const translations  = require('./translations');

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
        if(err) {
            loggerService.error(err, errorTypes.failedRepositoryProcess, repository);
        }
        else {
            loggerService.info(`Completed processing ${repository.owner}/${repository.repo}`, 'repo-completed');
        }

        next();
    });
};

async.eachOfSeries(config.repositories, (repositories, owner, next) => {
    async.eachSeries(repositories, (repo, next) => {

        processRepo({ owner, repo }, next);
        
    }, next);
}, () => {
    resources.fetchRequestRateStats(() => {
        loggerService.info(`Completed running`, 'run-completed');
        process.exit(0);
    });
});
