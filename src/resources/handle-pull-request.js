'use strict';

const config = require('config');
const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const Logger = require('../services/logger-service');
const metadataFormatter = require('../utils/format-pr-metadata');

const loggerService = Logger();

module.exports = (repository, callback) => {
    if (repository.skipPullRequest) {
        return callback(null, repository);
    }

    const prAlreadyExists = repository.prInfo.found && !repository.prInfo.outdated;
    const action = prAlreadyExists ? 'Updating' : 'Creating';

    loggerService.console(`${action} github pull request for ${repository.owner}/${repository.repo}`);

    const pullRequestMetadata = metadataFormatter.format(repository);

    const prOptions = {
        owner: repository.owner,
        repo: repository.repo,
        head: `${config.github.owner}:${config.github.branch}`,
        title: pullRequestMetadata.title,
        base: repository.manifestContent.workingBranch,
        body: pullRequestMetadata.body
    };

    let handlePr;

    if (prAlreadyExists) {
        prOptions.number = repository.prInfo.number;
        handlePr = github.updatePullRequest;
    } else {
        handlePr = github.createPullRequest;
    }

    handlePr(prOptions, err => {
        if (err) {
            err = new Error(`Failed while ${action.toLowerCase()} pull request`);
            loggerService.error(err, errorTypes[`failed${action}PullRequest`], repository);
        }

        callback(err, repository);
    });
};
