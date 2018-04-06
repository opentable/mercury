'use strict';

const _ = require('lodash');
const File = require('./github/file');
const Github = require('github');
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

  const file = File(config, github);
  const pullRequest = PullRequest(config, github);
  const rateLimit = RateLimit(config, github);
  const reference = Reference(config, github);
  const utils = require('./github/utils')(config);

  const getFilesList = (options, next) => {
    const authenticatedGithub = utils.authenticateGithubOperation('read', github);

    reference.get(options, (err, sha) => {
      if (err) {
        return next(err);
      }

      options.recursive = true;
      options.sha = sha;

      authenticatedGithub.gitdata.getTree(options, (err, list) => {
        next(err, list ? _.map(list.tree, x => x.path) : undefined);
      });
    });
  };

  const ensureFork = (options, next) => {
    const authenticatedGithub = utils.authenticateGithubOperation('write', github);

    authenticatedGithub.repos.fork(options, next);
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
