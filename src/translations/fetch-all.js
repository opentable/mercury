'use strict';

const _ = require('lodash');
const async = require('async');
const errorTypes = require('../constants/error-types');
const smartling = require('../services/smartling');

const getAllSmartlingFilenames = repository => {
  const list = [];

  _.each(repository.translationFiles, file => {
    _.each(repository.targetLocales, localeId => {
      list.push({ localeId, fileName: file.src });
    });
  });

  return list;
};

module.exports = ({ emitter, config }) => (repository, callback) => {
  emitter.emit('action', { message: `Fetching secondary language files from smartling for ${repository.owner}/${repository.repo}` });

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
          let current = _.find(repository.translationFiles, {
            src: file.fileName
          });

          current.locales = current.locales || {};
          current.locales[file.localeId] = { smartlingContent: content };
        }

        next(err);
      });
    },
    err => {
      if (err) {
        emitter.emit('error', { error: err, errorType: errorTypes.failedSmartlingFetchFiles, details: repository });
        repository.skip = true;
      }

      callback(err, repository);
    }
  );
};
