'use strict';

const _ = require('lodash');

module.exports = octokit => {
  const deleteReference = (options, next) => {
    options.ref = `heads/${options.branch}`;

    getReference(options, (err, branchReferenceSha) => {
      if (branchReferenceSha) {
        return octokit.git
          .deleteRef(options)
          .then(() => next())
          .catch(err => next(err));
      }

      next(new Error('Reference has already been manually deleted by the repo owners'));
    });
  };

  const getReference = (options, next) => {
    options.ref = `heads/${options.branch}`;

    octokit.gitdata
      .getRef(options)
      .then(({ data }) => {
        next(null, _.get(data, ['object', 'sha']));
      })
      .catch(err => next(err));
  };

  const getOrCreate = (options, sourceSha, next) => {
    getReference(options, (err, branchReferenceSha) => {
      if (branchReferenceSha) {
        return next(err, branchReferenceSha);
      }

      options.ref = `refs/heads/${options.branch}`;
      options.sha = sourceSha;

      octokit.git
        .createRef(options)
        .then(({ data }) => {
          next(err, _.get(data, [`object`, `sha`]));
        })
        .catch(err => next(err));
    });
  };

  const update = (options, next) => {
    options.ref = `heads/${options.branch}`;
    options.sha = options.reference;

    octokit.git
      .updateRef(options)
      .then(() => next())
      .catch(err => next(err));
  };

  return {
    delete: deleteReference,
    get: getReference,
    getOrCreate,
    update
  };
};
