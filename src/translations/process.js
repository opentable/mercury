'use strict';

const async = require('async');
const config = require('config');
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
        projectId: '7aebed099' 
    };
    
    async.eachOfSeries(repository.translationFiles, (translation, index, callback) => {
        
        githubOptions.path = translation.github;
        smartlingOptions.path = translation.smartling;
        
        github.getFileContent(githubOptions, (err, githubFileContent) => {
            smartling.uploadFileContent(githubFileContent, smartlingOptions, (err, smartlingUploadResult) => {
                
                if(err) {
                    repository.translationFiles[index].report = err.message;
                    return callback();
                }
                
                console.log(smartlingUploadResult);
                                                
                if(smartlingUploadResult.response.data && smartlingUploadResult.response.data.overWritten) {
                    repository.translationFiles[index].report = 'Existing Smartling file overwritten';
                } else {
                    repository.translationFiles[index].report = 'New Smartling file uploaded';
                }

                callback();
            });
        });
    }, (err) => {
        callback(err, repository);
    });
}
