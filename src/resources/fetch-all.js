'use strict';

const _                 = require('lodash');
const async             = require('async');
const config            = require('config');
const errorTypes        = require('../resources/error-types');
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
    const destGlob = _.first(repository.manifestContent.translations).output.dest;
    
    _.each(repository.translationFiles, (file) => {
        _.each(repository.targetLocales, (localeId) => {
            const fileName = mapFileName(file.github, localeId, destGlob);
            list.push({ localeId, fileName, source: file.github });
        });
    });
    
    return list;
};

module.exports = (repository, callback) => {
    
    const githubOptions = {
        apiToken: config.github.apiToken,
        repo: repository.repo,
        owner: repository.owner
    };
    
    const filesToDownload = getAllGithubFilenames(repository);
        
    async.eachSeries(filesToDownload, (file, next) => {
        
        githubOptions.path = file.fileName;
                
        github.getFileContent(githubOptions, (err, content) => {
                        
            if(err && err.code !== 404){
                return next(new Error(err.message));    
            }

            let current = _.find(repository.translationFiles, translationFile => {
                return translationFile.github === file.source
            });
            
            current.locales = current.locales || {};
            _.assign(current.locales[file.localeId], { githubPath: file.fileName, githubContent: content });
                        
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
