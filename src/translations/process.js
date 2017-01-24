'use strict';

const async = require('async');
const config = require('config');
const diff = require('deep-diff').diff;
const github = require('../services/github');
const smartling = require('../services/smartling');

module.exports = (repository, callback) => {
    
    const githubOptions = {
		apiToken: config.github.apiToken,
		repo: repository.repo,
		owner: repository.owner
	};
    
    const smartlingOptions = {
        userIdentifier: config.smartling.userIdentifier,
        userSecret: config.smartling.userSecret,
        projectId: repository.manifestContent.smartlingProjectId 
    };
    
    async.eachOfSeries(repository.translationFiles, (translation, index, callback) => {
        
        githubOptions.path = translation.github;
        smartlingOptions.path = translation.smartling;
        
        github.getFileContent(githubOptions, (err, githubFileContent) => {
            smartling.getFileContent(smartlingOptions, (err, smartlingFileContent) => {
                
                if(err) {
                    repository.translationFiles[index].report = 'Error';
                    return callback();
                }
                
                const difference = diff(githubFileContent, smartlingFileContent);
                                
                if(difference) {
                    repository.translationFiles[index].report = 'Unsynced';
                } else {
                    repository.translationFiles[index].report = 'Synced';
                }

                callback();
            });
    	});
    }, (err) => {
        callback(null, repository);
    });
}
