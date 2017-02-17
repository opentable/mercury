'use strict';

const _         = require('lodash');
const Logger    = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Diffing secondary language files for ${repository.owner}/${repository.repo}`);
    
    let result = repository;
    
    _.forEach(repository.translationFiles, (file, fileIndex) => {
        _.forEach(file.locales, (locale, localeKey) => {
            if(locale.smartlingContent === locale.githubContent) {
                result.translationFiles[fileIndex].locales[localeKey].isDifferent = false;
            }
            else {
                result.translationFiles[fileIndex].locales[localeKey].isDifferent = true;
            }
        });
    });
    
    callback(null, result);
};
