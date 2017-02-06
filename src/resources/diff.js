'use strict';

const _ = require('lodash')

module.exports = (repository, callback) => {
    
    let result = repository;
    
    _.forEach(repository.translationFiles, (file, fileIndex) => {
        _.forEach(file.locales, (locale, localeKey) => {
            if(locale.smartlingContent === locale.githubContent) {
                result.translationFiles[fileIndex].locales[localeKey].isChanged = false;
            }
            else {
                result.translationFiles[fileIndex].locales[localeKey].isChanged = true;
            }
        });
    });
    
    callback(null, result);
};
