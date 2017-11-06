'use strict';

const _ = require('lodash');
const async = require('async');
const config = require('config');
const errorTypes = require('../constants/error-types');
const Logger = require('../services/logger-service');
const smartling = require('../services/smartling');

const loggerService = Logger();

const getAllSmartlingFilenames = repository => {
    const list = [];

    _.each(repository.translationFiles, file => {
        _.each(repository.targetLocales, localeId => {
            list.push({ localeId, fileName: file.src });
        });
    });

    return list;
};

module.exports = (repository, callback) => {
    loggerService.console(`Fetching secondary language files from smartling for ${repository.owner}/${repository.repo}`);

    const smartlingOptions = {
        userIdentifier: config.smartling.userIdentifier,
        userSecret: config.smartling.userSecret,
        projectId: repository.manifestContent.smartlingProjectId
    };

    const filesToDownload = getAllSmartlingFilenames(repository);

    async.eachLimit(
        filesToDownload,
        smartling.MAX_CONCURRENT_OPERATIONS,
        (file, next) => {
            const options = _.extend(_.cloneDeep(smartlingOptions), file);

            smartling.fetchFile(options, (err, content) => {
                if (!err && content) {
                    let current = _.find(repository.translationFiles, { src: file.fileName });

                    current.locales = current.locales || {};
                    current.locales[file.localeId] = { smartlingContent: content };
                }

                next(err);
            });
        },
        err => {
            if (err) {
                loggerService.error(err, errorTypes.failedSmartlingFetchFiles, repository);
                repository.skip = true;
            }

            callback(err, repository);
        }
    );
};
