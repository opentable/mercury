'use strict';

const _                 = require('lodash');
const async             = require('async');
const errorTypes        = require('../constants/error-types');
const github            = require('../services/github');
const Logger            = require('../services/logger-service');
const path              = require('path');
const stringToTemplate  = require('string-to-template');

const loggerService = Logger();

const mapFileName = (file, locale, destGlob) => stringToTemplate(destGlob, {
    locale,
    filename: path.basename(file)
});

const getAllGithubFilenames = (repository) => {
    const list = [];
    
    _.each(repository.translationFiles, (file) => {
        _.each(repository.targetLocales, (localeId) => {
            const fileName = mapFileName(file.src, localeId, file.dest);
            list.push({ localeId, fileName, source: file.src });
        });
    });
    
    return list;
};

module.exports = (repository, callback) => {

    loggerService.console(`Fetching secondary language files from github for ${repository.owner}/${repository.repo}`);
    
    const githubOptions = {
        repo: repository.repo,
        owner: repository.owner
    };
    
    const filesToDownload = getAllGithubFilenames(repository);
        
    async.eachLimit(filesToDownload, github.MAX_CONCURRENT_OPERATIONS, (file, next) => {
        
        const options = _.extend(_.cloneDeep(githubOptions), {
            path: file.fileName
        });

        github.getFile(options, (err, githubFile) => {
                        
            if(err && err.code !== 404){
                return next(new Error(err.message));    
            }

            let current = _.find(repository.translationFiles, translationFile => {
                return translationFile.src === file.source
            });
            
            current.locales = current.locales || {};
            _.assign(current.locales[file.localeId], { githubPath: file.fileName, githubContent: githubFile.content });
                        
            next();
        });
    }, (err) => {
        
        if(err){
            loggerService.error(err, errorTypes.failedGithubFetchFiles, repository);
            repository.skip = true;
        }
        
        callback(err, repository);
    });
};
