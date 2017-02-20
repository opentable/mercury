'use strict';

const config    = require('config');
const github    = require('../services/github');
const Logger    = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Creating github pull request for ${repository.owner}/${repository.repo}`);
                
    const prOptions = {
        owner: repository.owner,
        repo: repository.repo,
        head: `${config.github.owner}:${config.github.branch}`,
        title: 'Mercury Pull Request',
        base: 'master',
        body: `Placeholder for Smartling status.`
    };

    github.ensurePullRequest(prOptions, (err) => {
        if(err) { return callback(err); }
        
        callback(err, repository);
    });
};
