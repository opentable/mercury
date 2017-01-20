'use strict';

let github = new require('github')({
    protocol: 'https',
    host: 'api.github.com',
    headers: {
        'user-agent': 'mercury'
    },
    followRedirects: false,
    timeout: 5000
});

module.exports = {
    getFileContent: (options, next) => {
        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        github.repos.getContent(options, (err, file) => {
            const getContent = f => new Buffer(f.content, f.encoding).toString();
            const content = !err && file ? getContent(file) : undefined;
            return next(err, content);
        });
    },
    getFilesList: (options, next) => {
        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        github.repos.getContent(options, (err, list) => {
            return next(err, list);
        });
    }
};
