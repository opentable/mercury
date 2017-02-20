'use strict';

const config = require('config');
const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const Logger = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Ensuring existence of a mercury branch for ${repository.mercuryForkOwner}/${repository.repo}`);
    
    const options = {
        branch: config.github.branch,
        owner: repository.mercuryForkOwner,
        repo: repository.repo
    };
    
    github.getMasterReference(options, (err, masterReferenceSha) => {
        if(err){
            loggerService.error(err, errorTypes.failedGithubBranch, repository);
            repository.skip = true;
            return callback(err, repository);
        }
        
        github.ensureBranchReference(options, masterReferenceSha, (err, mercuryReferenceSha) => {
            if(err){
                loggerService.error(err, errorTypes.failedGithubBranch, repository);
                repository.skip = true;
            }
                    
            repository.mercuryBranchReference = mercuryReferenceSha;
            callback(err, repository);
        });
    });
};
