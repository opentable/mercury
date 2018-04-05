'use strict';

const _ = require('lodash');
const config = require('config');
const utils = require('./utils');

module.exports = github => ({
  close: (options, next) => {
    const authenticatedGithub = utils.authenticateGithubOperation('write', github);
    options.state = 'closed';

    authenticatedGithub.pullRequests.update(options, next);
  },

  create: (options, next) => {
    const authenticatedGithub = utils.authenticateGithubOperation('write', github);

    authenticatedGithub.pullRequests.create(options, next);
  },

  get: (options, next) => {
    const authenticatedGithub = utils.authenticateGithubOperation('read', github);
    const prOptions = _.extend(_.cloneDeep(options), {
      head: `${config.github.owner}:${config.github.branch}`,
      per_page: 1,
      state: 'open'
    });

    authenticatedGithub.pullRequests.getAll(prOptions, (err, prs) => {
      if (err) {
        return next(err);
      } else if (_.isEmpty(prs)) {
        return next(null, { found: false });
      }

      const pr = _.head(prs);

      next(null, {
        createdAt: pr.created_at,
        found: true,
        number: pr.number
      });
    });
  },

  update: (options, next) => {
    const authenticatedGithub = utils.authenticateGithubOperation('write', github);

    authenticatedGithub.pullRequests.update(options, next);
  }
});
