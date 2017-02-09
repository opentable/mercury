'use strict';

const _				= require('lodash');
const async			= require('async');
const config		= require('config');
const errorTypes	= require('../resources/error-types');
const Logger 		= require('../services/logger-service');
const smartling 	= require('../services/smartling');

const loggerService = Logger();

const mapLocaleStatus = (current, status, next) => {
    _.forEach(current.locales, (locale, localeKey) => {
        
        const smartlingRepoLocale = current.locales[localeKey];
        const smartlingStatusLocale = _.find(status.items, { localeId: localeKey });
        
        smartlingRepoLocale.smartlingStatus = {
            authorizedStringCount: smartlingStatusLocale.authorizedStringCount,
            authorizedWordCount: smartlingStatusLocale.authorizedWordCount,
            completedStringCount: smartlingStatusLocale.completedStringCount,
            completedWordCount: smartlingStatusLocale.completedWordCount
        };
    });
    
    next();
}

module.exports = (repository, callback) => {
    
    const smartlingOptions = {
        userIdentifier: config.smartling.userIdentifier,
        userSecret: config.smartling.userSecret,
        projectId: repository.manifestContent.smartlingProjectId
    };
        
    async.eachSeries(repository.translationFiles, (file, next) => {
        smartling.getStatus(_.extend(smartlingOptions, { fileUri: file.smartling }), (err, status) => {
                        
            if(!err && status){
                let current = _.find(repository.translationFiles, { smartling: file.smartling });
                
                current.totalStringCount = status.totalStringCount;
                current.totalWordCount = status.totalWordCount;
                return mapLocaleStatus(current, status, next);
            }
            
            next(err);
        });
    }, (err) => {
        
        if(err){
            loggerService.error(err, errorTypes.failedSmartlingGetStatus, repository);
            repository.skip = true;
        }
        
        callback(err, repository);
    });
};
