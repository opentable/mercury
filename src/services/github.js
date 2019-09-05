'use strict';

const _ = require('lodash');
const File = require('./github/file');
const Github = require('github');
const Octokit = require('@octokit/rest');
const PullRequest = require('./github/pull-request');
const RateLimit = require('./github/rate-limit');
const Reference = require('./github/reference');

module.exports = config => {
  const MAX_CONCURRENT_OPERATIONS = 20;

  const github = new Github({
    protocol: 'https',
    host: 'api.github.com',
    headers: {
      'user-agent': 'mercury'
    },
    followRedirects: false,
    timeout: 20000
  });

  const octokit = new Octokit({
    auth: () => {
      return config.github.apiTokens[0].value;
    },
    baseUrl: 'https://api.github.com',
    userAgent: 'mercury'
  });

  const file = File(config, octokit);
  const pullRequest = PullRequest(config, octokit);
  const rateLimit = RateLimit(config, github);
  const reference = Reference(octokit);

  const getFilesList = (options, next) => {
    reference.get(options, (err, sha) => {
      if (err) {
        return next(err);
      }

      options.recursive = 1;
      options.tree_sha = sha;

      octokit.git
        .getTree(options)
        .then(({ data }) => {
          next(null, _.map(data.tree, x => x.path));
        })
        .catch(err => next(err));
    });
  };

  const ensureFork = (options, next) => {
    octokit.repos
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
