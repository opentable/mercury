'use strict';

const _ = require('lodash');
const File = require('./github/file');
const Octokit = require('@octokit/rest');
const PullRequest = require('./github/pull-request');
const RateLimit = require('./github/rate-limit');
const Reference = require('./github/reference');

module.exports = config => {
  const MAX_CONCURRENT_OPERATIONS = 20;

  const readOctokit = new Octokit({
    auth: () => {
      const tokens = _.filter(config.github.apiTokens, ['operation', 'read']);
      const token = _.sample(tokens).value;
      return token;
    },
    baseUrl: 'https://api.github.com',
    userAgent: 'mercury'
  });

  const writeOctokit = new Octokit({
    auth: () => {
      const tokens = _.filter(config.github.apiTokens, ['operation', 'write']);
      const token = _.sample(tokens).value;
      return token;
    },
    baseUrl: 'https://api.github.com',
    userAgent: 'mercury'
  });

  const file = File(config, readOctokit, writeOctokit);
  const pullRequest = PullRequest(config, readOctokit, writeOctokit);
  const rateLimit = RateLimit(config);
  const reference = Reference(readOctokit, writeOctokit);

  const getFilesList = (options, next) => {
    reference.get(options, (err, sha) => {
      if (err) {
        return next(err);
      }

      options.recursive = 1;
      options.tree_sha = sha;

      readOctokit.git
        .getTree(options)
        .then(({ data }) => {
          next(null, _.map(data.tree, x => x.path));
        })
        .catch(err => next(err));
    });
  };

  const ensureFork = (options, next) => {
    writeOctokit.repos
      .createFork(options)
      .then(({ data }) => next(null, data))
      .catch(err => next(err));
  };

  return {
    closePullRequest: pullRequest.close,
    createPullRequest: pullRequest.create,
    createFile: file.create,
    deleteReference: reference.delete,
    ensureBranchReference: reference.getOrCreate,
    ensureFork,
    getBranchReference: reference.get,
    getFile: file.get,
    getFileChangedInfo: file.lastUpdated,
    getFilesList,
    getPullRequestInfo: pullRequest.get,
    getRequestRateStats: rateLimit.get,
    MAX_CONCURRENT_OPERATIONS,
    updateFile: file.update,
    updatePullRequest: pullRequest.update,
    updateReference: reference.update
  };
};
