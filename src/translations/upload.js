'use strict';

const _ = require('lodash');
const async = require('async');
const errorTypes = require('../constants/error-types');
const smartling = require('../services/smartling');

module.exports = ({ emitter, config }) => (repository, callback) => {
  if (repository.manifestContent.readOnly) {
    emitter.emit('action', { message: `Skipping the smartling upload for readOnly repo ${repository.owner}/${repository.repo}` });
    return callback(null, repository);
  }

  emitter.emit('action', { message: `Uploading source files to smartling for ${repository.owner}/${repository.repo}` });

  const githubOptions = {
    repo: repository.repo,
    owner: repository.owner
  };

  const smartlingOptions = {
    userIdentifier: config.smartling.userIdentifier,
    userSecret: config.smartling.userSecret,
    projectId: repository.manifestContent.smartlingProjectId
  };

  const github = require('../services/github')(config);

  async.eachOfLimit(
    repository.translationFiles,
    smartling.MAX_CONCURRENT_OPERATIONS,
    (translation, index, callback) => {
      const path = translation.src;

      const options = _.assignIn(_.cloneDeep(githubOptions), {
        path
      });

      github.getFile(options, (err, file) => {
        const options = _.assignIn(_.cloneDeep(smartlingOptions), {
          path
        });

        smartling.uploadFileContent(file.content, options, (err, smartlingUploadResult) => {
          if (err) {
            repository.translationFiles[index].report = err.message;
            return callback(err);
          }

          if (smartlingUploadResult.response.data && smartlingUploadResult.response.data.overWritten) {
            repository.translationFiles[index].report = 'Existing Smartling file overwritten';
          } else {
            repository.translationFiles[index].report = 'New Smartling file uploaded';
          }

          callback();
        });
      });
    },
    err => {
      if (err) {
        emitter.emit('error', { error: err, errorType: errorTypes.failedSmartlingUploadFiles, details: repository });
        repository.skip = true;
      }

      callback(err, repository);
    }
  );
};
