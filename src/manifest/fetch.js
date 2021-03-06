'use strict';

const errorTypes = require('../constants/error-types');

module.exports = ({ emitter, config }) => (repository, callback) => {
  emitter.emit('action', { message: `Fetching manifest from github for ${repository.owner}/${repository.repo}` });

  const github = require('../services/github')(config);
  const options = {
    path: 'mercury.json',
    repo: repository.repo,
    owner: repository.owner
  };

  github.getFile(options, (err, file) => {
    if (err) {
      err = new Error('mercury.json not found. Skipping.');
      emitter.emit('error', { error: err, errorType: errorTypes.failedToLocateManifest, details: repository });
      repository.skip = true;
    } else {
      try {
        repository.manifestContent = JSON.parse(file.content);
      } catch (e) {
        err = new Error('An error happened when parsing mercury.json');
        emitter.emit('error', { error: err, errorType: errorTypes.failedToParseManifest, details: repository });
        repository.skip = true;
      }
    }

    if (err) {
      return callback(err, repository);
    }

    github.getFileChangedInfo(options, (err, changedDate) => {
      if (err) {
        err = new Error('An error happened when fetching mercury.json info');
        emitter.emit('error', { error: err, errorType: errorTypes.failedToFetchManifestInfo, details: repository });
        repository.skip = true;
      }

      repository.manifestUpdated = changedDate;
      callback(err, repository);
    });
  });
};
