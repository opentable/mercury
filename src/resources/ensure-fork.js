'use strict';

const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const Logger = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {
    loggerService.console(`Ensuring existence and validity of a Mercury fork for ${repository.owner}/${repository.repo}`);

    const options = {
        owner: repository.owner,
        repo: repository.repo
    };

    const branch = repository.manifestContent.workingBranch;

    github.ensureFork(options, (err, result) => {
        if (err) {
            loggerService.error(err, errorTypes.failedGithubFork, repository);
            repository.skip = true;
            return callback(err, repository);
        }

        repository.mercuryForkName = result && result.full_name ? result.full_name : null;
        repository.mercuryForkOwner = result && result.owner ? result.owner.login : null;

        const branchUpstreamOptions = {
            branch,
            owner: repository.owner,
            repo: repository.repo
        };

        github.getBranchReference(branchUpstreamOptions, (err, branchSha) => {
            if (err) {
                err = new Error(`Could not fetch the upstream/${branch} reference`);
                loggerService.error(err, errorTypes.failedToFetchBranchReference, repository);
                repository.skip = true;
                return callback(err, repository);
            }

            const forkOptions = {
                branch,
                owner: repository.mercuryForkOwner,
                reference: branchSha,
                repo: repository.repo
            };

            setTimeout(() => {
                github.updateReference(forkOptions, err => {
                    if (err) {
                        err = new Error(`Could not rebase fork from upstream/${branch} - forks are created asynchronously so will retry in the next round.`);
                        loggerService.error(err, errorTypes.failedGithubForkRebase, repository);
                        repository.skip = true;
                    }

                    callback(err, repository);
                });
            }, 2000);
        });
    });
};
