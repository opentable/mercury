'use strict';

const async = require('async');
const config = require('config');
const github = require('../services/github');
const Logger        = require('../services/logger-service');
const smartling = require('../services/smartling');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Uploading source files to smartling for ${repository.owner}/${repository.repo}`);
    
    const githubOptions = {
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
        
        github.getFile(githubOptions, (err, file) => {
            
            const githubFileContent = file.content;
            
            smartling.uploadFileContent(githubFileContent, smartlingOptions, (err, smartlingUploadResult) => {
                
                if(err) {
                    repository.translationFiles[index].report = err.message;
                    return callback();
                }
                                                                
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
