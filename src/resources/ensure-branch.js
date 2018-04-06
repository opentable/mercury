'use strict';

const errorTypes = require('../constants/error-types');

module.exports = ({ emitter, config }) => (repository, callback) => {
  emitter.emit('action', { message: `Ensuring existence of a mercury branch for ${repository.mercuryForkOwner}/${repository.repo}` });

  const github = require('../services/github')(config);
  const options = {
    branch: repository.manifestContent.workingBranch,
    owner: repository.mercuryForkOwner,
    repo: repository.repo
  };

  github.getBranchReference(options, (err, branchReferenceSha) => {
    if (err) {
      emitter.emit('error', { error: err, errorType: errorTypes.failedGithubBranch, details: repository });
      repository.skip = true;
      return callback(err, repository);
    }

    const branchOptions = {
      branch: config.github.branch,
      owner: repository.mercuryForkOwner,
      repo: repository.repo
    };

    github.ensureBranchReference(branchOptions, branchReferenceSha, (err, mercuryReferenceSha) => {
      if (err) {
        emitter.emit('error', { error: err, errorType: errorTypes.failedGithubBranch, details: repository });
        repository.skip = true;
      }

      repository.mercuryBranchReference = mercuryReferenceSha;
      callback(err, repository);
    });
  });
};
