'use strict';

const _ = require('lodash');
const async = require('async');
const github = require('../services/github');

module.exports = (repository, callback) => {
        
    github.ensureFork(err => {
        if(err) { return callback(err); }
        
        github.getMasterReference((err, masterReferenceSha) => {
            if(err) { return callback(err); }

            github.ensureBranchReference(masterReferenceSha, (err) => {
                if(err) { return callback(err); }
                                
                async.eachSeries(repository.translationFiles, (file, callback) => {
                    async.eachOfSeries(file.locales, (locale, localeId, callback) => {
                        
                        const options = {
                            owner: 'mercurybot',
                            repo: repository.repo,
                            path: locale.githubPath,
                            ref: 'mercury',
                            content: locale.smartlingContent,
                            message: `Automatic Mercury commit for adding ${localeId} to file ${locale.githubPath}`
                        };
                        
                        github.getFileContent(options, (err, content) => {
                            if(err && err.status !== 'Not Found') { return callback(err); }
                                                    
                            if(locale.isDifferent) {
                                if(!content) {
                                    _.set(options, 'branch', options.ref);
                                    _.unset(options, 'ref');
                                    return github.createFile(options, callback);
                                } else if(content && content !== locale.smartlingContent) {
                                    github.getFileSha(options, (err, sha) => {
                                        options.sha = sha;
                                        _.set(options, 'branch', options.ref);
                                        _.unset(options, 'ref');
                                        return github.updateFile(options, callback);
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

                    const options = {
                        owner: repository.owner,
                        repo: repository.repo,
                        head: 'mercurybot:mercury',
                        title: 'Mercury Pull Request',
                        base: 'master',
                        body: `Placeholder for Smartling status.`
                    };

                    github.ensurePullRequest(options, (err) => {
                        if(err) { return callback(err); }
                        
                        callback(err, repository);
                    });
                });
            });
        });
    });
};
