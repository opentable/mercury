'use strict';

const _             = require('lodash');
const config        = require('config');
const File          = require('./github/file');
const Github        = require('github');
const PullRequest   = require('./github/pull-request');
const Reference     = require('./github/reference');

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

github.authenticate({
    type: 'oauth',
    token: config.github.apiToken
});

const file = File(github);
const pullRequest = PullRequest(github);
const reference = Reference(github);

const getFilesList = (options, next) => {

    reference.get(options, (err, sha) => {

        if(err){ return next(err); }

        options.recursive = true;
        options.sha = sha;

        github.gitdata.getTree(options, (err, list) => {
            next(err, list ? _.map(list.tree, x => x.path) : undefined);
        });
    });
};

const ensureFork = github.repos.fork;

module.exports = {
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
    MAX_CONCURRENT_OPERATIONS,
    updateFile: file.update,
    updatePullRequest: pullRequest.update,
    updateReference: reference.update
};
