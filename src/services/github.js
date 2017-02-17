'use strict';

const _         = require('lodash');
const base64    = require('base-64');
const config 	= require('config');
const utf8      = require('utf8');

const github = new require('github')({
    protocol: 'https',
    host: 'api.github.com',
    headers: {
        'user-agent': 'mercury'
    },
    followRedirects: false,
    timeout: 5000
});

github.authenticate({
    type: 'oauth',
    token: config.github.apiToken
});

const encodeContent = (content) => {
    const bytes = utf8.encode(content);
    const encoded = base64.encode(bytes);
    return encoded;
};

const getFile = (options, next) => {
    
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
};

const getReferenceSha = (options, next) => {
    
    options.ref = 'heads/master';

    github.gitdata.getReference(options, (err, reference) => {
        next(err, reference ? reference.object.sha : undefined);
    });
};

const getFilesList = (options, next) => {

    getReferenceSha(options, (err, sha) => {

        if(err){ return next(err); }

        options.recursive = true;
        options.sha = sha;

        github.gitdata.getTree(options, (err, list) => {
            next(err, list ? _.map(list.tree, x => x.path) : undefined);
        });
    });
};

const ensureFork = (options, next) => {
    github.repos.fork(options, next);
};

const getReference = (options, referencePath, next) => {

    options.ref = referencePath;

    github.gitdata.getReference(options, (err, reference) => {
        next(err, reference ? reference.object.sha : undefined);
    });
};

const getMasterReference = (options, next) => getReference(options, 'heads/master', next);

const getBranchReference = (options, next) => getReference(options, `heads/${options.branch}`, next);

const ensureBranchReference = (options, sourceSha, next) => {

    getBranchReference(options, (err, branchReferenceSha) => {

        if(branchReferenceSha) {
            return next(err, branchReferenceSha);
        }
        
        options.ref = `refs/heads/${options.branch}`;
        options.sha = sourceSha;

        github.gitdata.createReference(options, (err, branchReference) => {
            if(err) { return next(err); }
            next(null, branchReference.object.sha);
        });
    });
};

const getFileSha = (options, next) => {
    github.repos.getContent(options, (err, file) => {
        const sha = !err && file ? file.sha : null;
        return next(err, sha);
    });
};

const createFile = (options, next) => {
    const encodedContent = encodeContent(options.content);
    _.set(options, 'content', encodedContent);
    github.repos.createFile(options, next);
};

const updateFile = (options, next) => {
    const encodedContent = encodeContent(options.content);
    _.set(options, 'content', encodedContent);
    github.repos.updateFile(options, next);
};

const ensurePullRequest = (options, next) => {
    
    github.pullRequests.getAll(options, (err, existingPullRequests) => {
        
        if(err && err.status !== 'Not Found') { return next(err); }
        
        const existingPullRequest = _.head(existingPullRequests);
        
        if(existingPullRequest) {
            options.number = existingPullRequest.number;
            github.pullRequests.update(options, next);
        } else {
            github.pullRequests.create(options, next);    
        }
    });
}

module.exports = {
    ensureBranchReference,
    ensureFork,
    getFile,
    getFileSha,
    getFilesList,
    getMasterReference,
    ensurePullRequest,
    createFile,
    updateFile
};
