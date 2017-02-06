'use strict';

const _ = require('lodash')

module.exports = (repository, callback) => {
    
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
