'use strict';

const _         = require('lodash');
const async     = require('async');
const config    = require('config');
const github    = require('../services/github');
const Logger    = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Creating github pull request for ${repository.owner}/${repository.repo}`);
                
    async.eachSeries(repository.translationFiles, (file, callback) => {
        async.eachOfSeries(file.locales, (locale, localeId, callback) => {
                        
            const commitOptions = {
                owner: config.github.owner,
                repo: repository.repo,
                path: locale.githubPath,
                ref: config.github.branch,
                content: locale.smartlingContent,
                message: `Automatic Mercury commit for adding ${localeId} to file ${locale.githubPath}`
            };
            
            github.getFile(commitOptions, (err, file) => {
                if(err && err.status !== 'Not Found') { return callback(err); }
                
                const content = file.content;
                const sha = file.sha;
                                        
                if(locale.isDifferent) {
                    if(!content) {
                        _.set(commitOptions, 'branch', commitOptions.ref);
                        _.unset(commitOptions, 'ref');
                        return github.createFile(commitOptions, callback);
                    } else if(content && content !== locale.smartlingContent) {
                        commitOptions.sha = sha;
                        _.set(commitOptions, 'branch', commitOptions.ref);
                        _.unset(commitOptions, 'ref');
                        return github.updateFile(commitOptions, callback);
                    } else {
                        return callback();
                    }
                } else {
                    callback();
                }
            });
            
        }, (err) => {
            if (err) { return callback(err); }
            callback();
        });
    }, (err) => {
                            
        if(err) { return callback(err); }

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
    });
};
