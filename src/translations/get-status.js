'use strict';

const _				  = require('lodash');
const async			  = require('async');
const config		  = require('config');
const errorTypes	  = require('../constants/error-types');
const Logger 		  = require('../services/logger-service');
const smartling 	  = require('../services/smartling');
const metadataCalculator = require('../utils/calculate-pr-metadata');

const loggerService = Logger();

const mapLocaleStatus = (current, status, next) => {
    _.forEach(current.locales, (locale, localeKey) => {
        
        const smartlingRepoLocale = current.locales[localeKey];
        const smartlingStatusLocale = _.find(status.items, { localeId: localeKey });
        
        if(smartlingStatusLocale) {
            smartlingRepoLocale.smartlingStatus = {
                excludedStringCount: smartlingStatusLocale.excludedStringCount,
                completedStringCount: smartlingStatusLocale.completedStringCount,
                percentCompleted: metadataCalculator.calculatePercent(smartlingStatusLocale.completedStringCount, current.totalStringCount)
            };
        } else {
            smartlingRepoLocale.smartlingStatus = {};
        }
    });
    
    next();
}

module.exports = (repository, callback) => {

    loggerService.info(`Getting translations' status from smartling for ${repository.owner}/${repository.repo}`);
    
    const smartlingOptions = {
        userIdentifier: config.smartling.userIdentifier,
        userSecret: config.smartling.userSecret,
        projectId: repository.manifestContent.smartlingProjectId
    };
        
    async.eachLimit(repository.translationFiles, smartling.MAX_CONCURRENT_OPERATIONS, (file, next) => {

        const options = _.extend(_.cloneDeep(smartlingOptions), {
            fileUri: file.src
        });

        smartling.getStatus(options, (err, status) => {
                        
            if(err || !status){
                return next(err);
            }
            
            let current = _.find(repository.translationFiles, { src: file.src });
            
            current.totalStringCount = status.totalStringCount;
            return mapLocaleStatus(current, status, next);
        });
    }, (err) => {
        
        if(err){
            loggerService.error(err, errorTypes.failedSmartlingGetStatus, repository);
            repository.skip = true;
        }
        
        callback(err, repository);
    });
};
