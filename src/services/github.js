'use strict';

const _ = require('lodash');

const github = new require('github')({
    protocol: 'https',
    host: 'api.github.com',
    headers: {
        'user-agent': 'mercury'
    },
    followRedirects: false,
    timeout: 5000
});

const getFileContent = (options, next) => {
    github.authenticate({
        type: 'oauth',
        token: options.apiToken
    });

    github.repos.getContent(options, (err, file) => {
        const getContent = f => new Buffer(f.content, f.encoding).toString();
        const content = !err && file ? getContent(file) : null;
        return next(err, content);
    });
};

const getReferenceSha = (options, next) => {
    github.authenticate({
        type: 'oauth',
        token: options.apiToken
    });

    options.ref = 'heads/master';

    github.gitdata.getReference(options, (err, reference) => {
        next(err, reference ? reference.object.sha : undefined);
    });
};

const getFilesList = (options, next) => {

    getReferenceSha(options, (err, sha) => {

        if(err){ return next(err); }

        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        options.recursive = true;
        options.sha = sha;

        github.gitdata.getTree(options, (err, list) => {
            next(err, list ? _.map(list.tree, x => x.path) : undefined);
        });
    });
};

module.exports = {
    getFileContent,
    getFilesList
};
