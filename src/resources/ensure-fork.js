'use strict';

const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const Logger = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Ensuring existence of a Mercury fork for ${repository.owner}/${repository.repo}`);
    
    const options = {
        owner: repository.owner,
        repo: repository.repo
    };
        
    github.ensureFork(options, (err, result) => {
        
        if(err){
            loggerService.error(err, errorTypes.failedGithubFork, repository);
            repository.skip = true;
        }
        
        repository.mercuryForkName = result && result.full_name ? result.full_name : null;
        repository.mercuryForkOwner = result && result.owner ? result.owner.login: null;

        callback(err, repository);
    });
};
