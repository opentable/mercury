'use strict';

const config    = require('config');
const github    = require('../services/github');
const Logger    = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    const prAlreadyExists = repository.prInfo.found && !repository.prInfo.outdated;
    const action = prAlreadyExists ? 'Updating' : 'Creating';

    loggerService.info(`${action} github pull request for ${repository.owner}/${repository.repo}`);

    const prOptions = {
        owner: repository.owner,
        repo: repository.repo,
        head: `${config.github.owner}:${config.github.branch}`,
        title: 'Mercury Pull Request',
        base: 'master',
        body: `Placeholder for Smartling status.`
    };

    let handlePr;

    if(prAlreadyExists){
        prOptions.number = repository.prInfo.number;
        handlePr = github.updatePullRequest;
    } else {
        handlePr = github.createPullRequest;
    }

    handlePr(prOptions, (err) => callback(err, repository));
};
