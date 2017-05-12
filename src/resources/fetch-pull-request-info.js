'use strict';

const errorTypes = require('../constants/error-types');
const github     = require('../services/github');
const Logger     = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Verifying existence of pending pull request for ${repository.owner}/${repository.repo}`);

    const prOptions = {
        owner: repository.owner,
        repo: repository.repo
    };
    
    github.getPullRequestInfo(prOptions, (err, prInfo) => {
        
        if(err){
            err = new Error('Failed while fetching pull request info');
            loggerService.error(err, errorTypes.failedToFetchPrInfo, repository);
            repository.skip = true;
        } else {
            repository.prInfo = prInfo;

            if(repository.prInfo.found){
                repository.prInfo.outdated = new Date(repository.prInfo.createdAt) < new Date(repository.manifestUpdated);
            }
        }

        callback(err, repository);
    });
};
