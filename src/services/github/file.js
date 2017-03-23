'use strict';

const _				= require('lodash');
const encodeContent = require('./utils').encodeContent;

module.exports = (github) => ({

    create: (options, next) => {
        const encodedContent = encodeContent(options.content);
        _.set(options, 'content', encodedContent);
        github.repos.createFile(options, (err, result) => {
            if(err) {
                return next(err);
            }
            next(null, result);
        });
    },

    get: (options, next) => {
    
        github.repos.getContent(options, (err, file) => {
            const getContent = f => new Buffer(f.content, f.encoding).toString();
            const content = !err && file ? getContent(file) : null;
            const sha = !err && file ? file.sha : null;
            const result = {
                content,
                sha
            };
            return next(err, result);
        });
    },

    lastUpdated: (options, next) => {

        options['per_page'] = 1;

        github.repos.getCommits(options, (err, commits) => {
            if(err || _.isEmpty(commits)){
                return next(err);
            }

            next(null, commits[0].commit.author.date);
        });
    },

    update: (options, next) => {
        const encodedContent = encodeContent(options.content);
        _.set(options, 'content', encodedContent);
        github.repos.updateFile(options, (err, result) => {
            if(err) {
                return next(err);
            }
            next(null, result);
        });
    }
});
