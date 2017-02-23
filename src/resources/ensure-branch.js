'use strict';

const config = require('config');
const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const Logger = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Ensuring existence of a mercury branch for ${repository.mercuryForkOwner}/${repository.repo}`);
    
    const options = {
        branch: 'master',
        owner: repository.mercuryForkOwner,
        repo: repository.repo
    };
    
    github.getBranchReference(options, (err, masterReferenceSha) => {
        if(err){
            loggerService.error(err, errorTypes.failedGithubBranch, repository);
            repository.skip = true;
            return callback(err, repository);
        }

        const branchOptions = {
            branch: config.github.branch,
            owner: repository.mercuryForkOwner,
            repo: repository.repo
        };
        
        github.ensureBranchReference(branchOptions, masterReferenceSha, (err, mercuryReferenceSha) => {
            if(err){
                loggerService.error(err, errorTypes.failedGithubBranch, repository);
                repository.skip = true;
            }
                    
            repository.mercuryBranchReference = mercuryReferenceSha;
            callback(err, repository);
        });
    });
};
