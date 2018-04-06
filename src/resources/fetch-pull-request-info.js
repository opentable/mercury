'use strict';

const errorTypes = require('../constants/error-types');

module.exports = ({ emitter, config }) => (repository, callback) => {
  emitter.emit('action', { message: `Verifying existence of pending pull request for ${repository.owner}/${repository.repo}` });

  const github = require('../services/github')(config);
  const prOptions = {
    owner: repository.owner,
    repo: repository.repo
  };

  github.getPullRequestInfo(prOptions, (err, prInfo) => {
    if (err) {
      err = new Error('Failed while fetching pull request info');
      emitter.emit('error', { error: err, errorType: errorTypes.failedToFetchPrInfo, details: repository });
      repository.skip = true;
    } else {
      repository.prInfo = prInfo;

      if (repository.prInfo.found) {
        repository.prInfo.outdated = new Date(repository.prInfo.createdAt) < new Date(repository.manifestUpdated);
      }
    }

    callback(err, repository);
  });
};
