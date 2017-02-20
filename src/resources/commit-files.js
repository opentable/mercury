'use strict';

const async = require('async');
const config = require('config');
const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const Logger = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Committing new or updated files to ${repository.mercuryForkOwner}/${repository.repo}`);
    
    async.eachSeries(repository.translationFiles, (file, callback) => {
        async.eachOfSeries(file.locales, (locale, localeId, callback) => {
                        
            const options = {
                owner: config.github.owner,
                repo: repository.repo,
                path: locale.githubPath,
                branch: config.github.branch,
                content: locale.smartlingContent,
                message: `Mercury commit for ${localeId} to file ${locale.githubPath}`
            };
                
            const content = locale.githubContent;
            
            if(locale.isDifferent) {
                if(!content) {
                    return github.createFile(options, callback);
                } else {
                    github.getFile(options, (err, file) => {
                        
                        if(err && err.code !== 404){
                            return callback(new Error(err.message));    
                        }
                        
                        options.sha = file.sha;
                        return github.updateFile(options, callback);
                    });
                } 
            } else {
                return callback();
            }
                                    
        }, (err) => {
            
            if(err){
                return callback(err);
            }
            
            callback();
        });
    }, (err) => {
                            
        if(err){
            loggerService.error(err, errorTypes.failedGithubCommit, repository);
            repository.skip = true;
        }
        
        callback(err, repository);
    });
};
