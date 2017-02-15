'use strict';

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
                        
                        if(locale.isDifferent) {
                            
                            github.upsertFile(options, (err) => {
                                if(err) { return callback(err); }                    
                                
                                return callback();
                            });
                        } else {
                            callback();
                        }
        
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

                    github.ensurePullRequest(options, (err, result) => {
                        if(err) { return callback(err); }
                        
                        console.log(err);
                        console.log(result);
                        
                        callback(err, repository);
                    });
                });
            });
        });
    });
};
