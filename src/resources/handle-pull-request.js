'use strict';

const config          = require('config');
const errorTypes      = require('../constants/error-types');
const github          = require('../services/github');
const Logger          = require('../services/logger-service');
const metadataFormatter = require('../utils/format-pr-metadata');

const loggerService = Logger();

module.exports = (repository, callback) => {

    const prAlreadyExists = repository.prInfo.found && !repository.prInfo.outdated;
    const action = prAlreadyExists ? 'Updating' : 'Creating';

    loggerService.info(`${action} github pull request for ${repository.owner}/${repository.repo}`);
    
    const pullRequestMetadata = metadataFormatter.format(repository);

    const prOptions = {
        owner: repository.owner,
        repo: repository.repo,
        head: `${config.github.owner}:${config.github.branch}`,
        title: pullRequestMetadata.title,
        base: 'master',
        body: pullRequestMetadata.body
    };

    let handlePr;

    if(prAlreadyExists){
        prOptions.number = repository.prInfo.number;
        handlePr = github.updatePullRequest;
    } else {
        handlePr = github.createPullRequest;
    }

    handlePr(prOptions, (err) => {
        if(err){
            err = new Error(`Failed while ${action.toLowerCase()} pull request`);
            loggerService.error(err, errorTypes[`failed${action}PullRequest`], repository);
        }

        callback(err, repository);
    });
};