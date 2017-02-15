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

const baseOptions = {
    owner: 'mercurybot',
    repo: 'mercury-sandbox'
};

const getFileContent = (options, next) => {
    
    github.repos.getContent(options, (err, file) => {
        const getContent = f => new Buffer(f.content, f.encoding).toString();
        const content = !err && file ? getContent(file) : null;
        return next(err, content);
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

const ensureFork = next => {

    const options = {
        owner: 'opentable',
        repo: 'mercury-sandbox'
    };

    github.repos.fork(options, next);
};

const getReference = (referencePath, next) => {

    const options = _.cloneDeep(baseOptions);
    options.ref = referencePath;

    github.gitdata.getReference(options, (err, reference) => {
        next(err, reference ? reference.object.sha : undefined);
    });
};

const getMasterReference = next => getReference('heads/master', next);

const getBranchReference = next => getReference('heads/mercury', next);

const ensureBranchReference = (sourceSha, next) => {

    getBranchReference((err, branchReferenceSha) => {

        if(branchReferenceSha) {
            return next(err, branchReferenceSha);
        }

        const options = _.cloneDeep(baseOptions);
        options.ref = 'refs/heads/mercury';
        options.sha = sourceSha;

        github.gitdata.createReference(options, (err, branchReference) => {
            if(err) { return next(err); }
            next(null, branchReference.object.sha);
        });
    });
};

const upsertFile = (content, next) => {
    
    const options = _.cloneDeep(baseOptions);
    options.path = 'test.txt';
    options.ref = 'mercury';
    
    github.repos.getContent(options, (err, existingFile) => {
        
        const bytes = utf8.encode('content');
        const encoded = base64.encode(bytes);
        options.content = encoded;
        options.message = 'test commit';
        
        if(err && err.status !== 'Not Found') { return next(err); }
        if(existingFile) {
            options.sha = existingFile.sha;
            options.branch = 'mercury';
            github.repos.updateFile(options, next);    
        } else {
            github.repos.createFile(options, next);
        }
    });
};

const ensurePullRequest = (next) => {
    
    const options = {
        owner: 'opentable',
        repo: 'mercury-sandbox',
        head: 'mercurybot:mercury'
    };
    
    github.pullRequests.getAll(options, (err, existingPullRequest) => {
        
        options.title = 'Mercury Pull Request';
        options.head = 'mercurybot:mercury';
        options.base = 'master';
        options.body = 'test description';
        
        if(err && err.status !== 'Not Found') { return next(err); }
        
        if(existingPullRequest) {
            options.number = existingPullRequest[0].number;
            github.pullRequests.update(options, next);
        } else {
            github.pullRequests.create(options, next);    
        }
    });
}

module.exports = {
    ensureBranchReference,
    ensureFork,
    getFileContent,
    getFilesList,
    getMasterReference,
    ensurePullRequest,
    upsertFile
};
