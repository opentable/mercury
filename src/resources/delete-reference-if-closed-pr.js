'use strict';

const config = require('config');
const errorTypes = require('../constants/error-types');
const github = require('../services/github');

module.exports = emitter => (repository, callback) => {
  if (repository.prInfo.found && !repository.prInfo.closed) {
    return callback(null, repository);
  }

  emitter.emit('action', `Deleting outdated reference for ${repository.mercuryForkOwner}/${repository.repo}`);

  const options = {
    owner: repository.mercuryForkOwner,
    repo: repository.repo,
    branch: config.github.branch
  };

  github.deleteReference(options, err => {
    if (err && err.message != 'Reference has already been manually deleted by the repo owners') {
      err = new Error('Failed while deleting outdated reference');
      emitter.emit('error', err, errorTypes.failedToDeleteOutdatedBranch, repository);
      repository.skip = true;
    } else {
      err = null;
    }

    callback(err, repository);
  });
};
