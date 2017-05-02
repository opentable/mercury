'use strict';

const _         = require('lodash');
const async     = require('async');
const config    = require('config');
const github    = require('../services/github');
const Logger    = require('../services/logger-service');
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
    
    async.eachOfLimit(repository.translationFiles, smartling.MAX_CONCURRENT_OPERATIONS, (translation, index, callback) => {
        
        const path = translation.src;

        const options = _.extend(_.cloneDeep(githubOptions), {
            path
        });
        
        github.getFile(options, (err, file) => {
            
            const options = _.extend(_.cloneDeep(smartlingOptions), {
                path
            });
            
            smartling.uploadFileContent(file.content, options, (err, smartlingUploadResult) => {
                
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
