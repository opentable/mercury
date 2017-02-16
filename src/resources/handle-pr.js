'use strict';

const _ = require('lodash');
const async = require('async');
const config = require('config');
const github = require('../services/github');

module.exports = (repository, callback) => {
    
    const forkOptions = {
        owner: repository.owner,
        repo: repository.repo
    };
        
    github.ensureFork(forkOptions, err => {
        if(err) { return callback(err); }
        
        const branchOptions = {
            owner: config.github.owner,
            repo: repository.repo
        };
        
        github.getMasterReference(branchOptions, (err, masterReferenceSha) => {
            if(err) { return callback(err); }

            github.ensureBranchReference(branchOptions, masterReferenceSha, (err) => {
                if(err) { return callback(err); }
                                
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
                        
                        github.getFileContent(commitOptions, (err, content) => {
                            if(err && err.status !== 'Not Found') { return callback(err); }
                                                    
                            if(locale.isDifferent) {
                                if(!content) {
                                    _.set(commitOptions, 'branch', commitOptions.ref);
                                    _.unset(commitOptions, 'ref');
                                    return github.createFile(commitOptions, callback);
                                } else if(content && content !== locale.smartlingContent) {
                                    github.getFileSha(commitOptions, (err, sha) => {
                                        commitOptions.sha = sha;
                                        _.set(commitOptions, 'branch', commitOptions.ref);
                                        _.unset(commitOptions, 'ref');
                                        return github.updateFile(commitOptions, callback);
                                    });
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
            });
        });
    });
};
