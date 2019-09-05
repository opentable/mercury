'use strict';

const errorTypes = require('../constants/error-types');

module.exports = ({ emitter, config }) => (repository, callback) => {
  emitter.emit('action', {
    message: `Ensuring existence and validity of a Mercury fork for ${repository.owner}/${repository.repo}`
  });

  const github = require('../services/github')(config);
  const options = {
    owner: repository.owner,
    repo: repository.repo
  };

  const branch = repository.manifestContent.workingBranch;

  github.ensureFork(options, (err, result) => {
    if (err) {
      emitter.emit('error', {
        error: err,
        errorType: errorTypes.failedGithubFork,
        details: repository
      });
      repository.skip = true;
      return callback(err, repository);
    }

    repository.mercuryForkName = result && result.full_name ? result.full_name : null;
    repository.mercuryForkOwner = result && result.owner ? 'mercurybot' : null;

    const branchUpstreamOptions = {
      branch,
      owner: repository.owner,
      repo: repository.repo
    };

    github.getBranchReference(branchUpstreamOptions, (err, branchSha) => {
      if (err) {
        err = new Error(`Could not fetch the upstream/${branch} reference`);
        emitter.emit('error', {
          error: err,
          errorType: errorTypes.failedToFetchBranchReference,
          details: repository
        });
        repository.skip = true;
        return callback(err, repository);
      }

      const forkOptions = {
        branch,
        owner: repository.mercuryForkOwner,
        reference: branchSha,
        repo: repository.repo
      };

      setTimeout(() => {
        github.updateReference(forkOptions, err => {
          if (err) {
            err = new Error(`Could not rebase fork from upstream/${branch} - forks are created asynchronously so will retry in the next round.`);
            emitter.emit('error', {
              error: err,
              errorType: errorTypes.failedGithubForkRebase,
              details: repository
            });
            repository.skip = true;
          }

          callback(err, repository);
        });
      }, 2000);
    });
  });
};
