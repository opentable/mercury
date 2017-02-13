'use strict';

const _         = require('lodash');
const config 	= require('config');

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

const referenceName = 'heads/mercury';

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

const getHeadCommit = (referenceSha, next) => {

    const options = _.cloneDeep(baseOptions);
    options.sha = referenceSha;
    
    github.gitdata.getCommit(options, (err, commit) => {
        if(err) { return next(err); }
        
        next(null, {
            sha: commit.sha,
            treeSha: commit.tree.sha
        });
    });
};

const createBlob = (content, next) => {
    
    const options = _.cloneDeep(baseOptions);
    options.content = content;
    options.encoding = 'utf-8';
    
    github.gitdata.createBlob(options, (err, blob) => {
        next(err, blob ? blob.sha : undefined);
    });
};

const createTree = (baseTreeSha, blobSha, next) => {
    
    const options = _.cloneDeep(baseOptions);
    options.base_tree = baseTreeSha;
    options.tree = [];
    options.tree.push({
        path: 'test.txt',
        mode: '100644',
        type: 'blob',
        sha: blobSha 
    });
    
    github.gitdata.createTree(options, (err, tree) => {
        next(err, tree ? tree.sha : undefined);
    });
};

const createCommit = (treeSha, headCommitSha, next) => {
    
    const options = _.cloneDeep(baseOptions);
    options.message = 'test commit';
    options.tree = treeSha;
    options.parents = [headCommitSha];
    
    github.gitdata.createCommit(options, (err, commit) => {
        next(err, commit ? commit.sha : undefined);
    });
};

const updateReference = (commitSha, next) => {
    
    const options = _.cloneDeep(baseOptions);
    options.ref = referenceName;
    options.sha = commitSha;
    
    github.gitdata.updateReference(options, next);
};

module.exports = {
    getFileContent,
    getFilesList,
    ensureFork,
    getMasterReference,
    ensureBranchReference,
    getHeadCommit,
    createBlob,
    createTree,
    createCommit,
    updateReference
};
