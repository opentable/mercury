'use strict';

const errorTypes = require('../constants/error-types');
const github = require('../services/github');

module.exports = emitter => (repository, callback) => {
  emitter.emit('action', `Fetching manifest from github for ${repository.owner}/${repository.repo}`);

  const options = {
    path: 'mercury.json',
    repo: repository.repo,
    owner: repository.owner
  };

  github.getFile(options, (err, file) => {
    if (err) {
      err = new Error('mercury.json not found. Skipping.');
      emitter.emit('error', err, errorTypes.failedToLocateManifest, repository);
      repository.skip = true;
    } else {
      try {
        repository.manifestContent = JSON.parse(file.content);
      } catch (e) {
        err = new Error('An error happened when parsing mercury.json');
        emitter.emit('error', err, errorTypes.failedToParseManifest, repository);
        repository.skip = true;
      }
    }

    if (err) {
      return callback(err, repository);
    }

    github.getFileChangedInfo(options, (err, changedDate) => {
      if (err) {
        err = new Error('An error happened when fetching mercury.json info');
        emitter.emit('error', err, errorTypes.failedToFetchManifestInfo, repository);
        repository.skip = true;
      }

      repository.manifestUpdated = changedDate;
      callback(err, repository);
    });
  });
};
