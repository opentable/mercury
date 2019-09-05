'use strict';

const _ = require('lodash');

module.exports = (config, octokit) => {
  return {
    close: (options, next) => {
      options.state = 'closed';

      octokit.pulls
        .update(options)
        .then(() => next(null))
        .catch(err => next(err));
    },

    create: (options, next) => {
      octokit.pulls
        .create(options)
        .then(() => next())
        .catch(err => next(err));
    },

    get: (options, next) => {
      const prOptions = _.assignIn(_.cloneDeep(options), {
        head: `${config.github.owner}:${config.github.branch}`,
        per_page: 1,
        state: 'open'
      });

      octokit.pulls
        .list(prOptions)
        .then(({ data }) => {
          if (_.isEmpty(data)) {
            return next(null, { found: false });
          }

          const pr = _.head(data);

          return next(null, {
            createdAt: pr.created_at,
            found: true,
            number: pr.number
          });
        })
        .catch(err => next(err));
    },

    update: (options, next) => {
      octokit.pulls
        .update(options)
        .then(() => next())
        .catch(err => next(err));
    }
  };
};
