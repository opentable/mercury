'use strict';

const _ = require('lodash');
const utils  = require('./utils');

module.exports = (github) => {
    
    const deleteReference = (options, next) => {
        
        const authenticatedGithub = utils.authenticateGithubOperation('write', github);
        options.ref = `heads/${options.branch}`;
        
        getReference(options, (err, branchReferenceSha) => {
            
            if(branchReferenceSha) { 
                return authenticatedGithub.gitdata.deleteReference(options, next); 
            }
            
            next(new Error('Reference has already been manually deleted by the repo owners'));
        });
    };

    const getReference = (options, next) => {
        const authenticatedGithub = utils.authenticateGithubOperation('read', github);
        options.ref = `heads/${options.branch}`;
        
        authenticatedGithub.gitdata.getReference(options, (err, reference) => next(err, _.get(reference, ['object', 'sha'])));
    };

    const getOrCreate = (options, sourceSha, next) => {
        
        const authenticatedGithub = utils.authenticateGithubOperation('write', github);

        getReference(options, (err, branchReferenceSha) => {

            if(branchReferenceSha) {
                return next(err, branchReferenceSha);
            }
            
            options.ref = `refs/heads/${options.branch}`;
            options.sha = sourceSha;

            authenticatedGithub.gitdata.createReference(options, (err, reference) => next(err, _.get(reference, ['object', 'sha'])));
        });
    };

    const update = (options, next) => {
        
        const authenticatedGithub = utils.authenticateGithubOperation('read', github);
        
        options.ref = `heads/${options.branch}`;
        options.sha = options.reference;
                
        authenticatedGithub.gitdata.updateReference(options, next);
    };

    return {
        delete: deleteReference,
        get: getReference,
        getOrCreate,
        update
    };
};
