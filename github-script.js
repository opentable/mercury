const _         = require('lodash');
const service   = require('./src/services/github');

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
    token: '5b2266e82788869e4b8626123b60229734a00633'
});

const referenceName = 'heads/mercury';

const baseOptions = {
    owner: 'mercurybot',
    repo: 'mercury-sandbox'
};

const forkOptions = {
    owner: 'opentable',
    repo: 'mercury-sandbox'
};

const content = 'test file content';

const doStuff = callback => {

    service.ensureFork(err => {
        if(err) { return callback(err); }

        service.getMasterReference((err, masterReferenceSha) => {
            if(err) { return callback(err); }

            service.ensureBranchReference(masterReferenceSha, (err, branchReferenceSha) => {
                if(err) { return callback(err); }

                service.getHeadCommit(branchReferenceSha, (err, headCommitSha) => {
                    if(err) { return callback(err); }

                    service.createBlob(content, (err, blobSha) => {
                        if(err) { return callback(err); }

                        service.createTree(headCommitSha.treeSha, blobSha, (err, treeSha) => {
                            if(err) { return callback(err); }
                            
                            service.createCommit(treeSha, headCommitSha.sha, (err, commitSha) => {
                                if(err) { return callback(err) }; 
                            
                                service.updateReference(commitSha, (err, result) => {
                                    if(err) { return callback(err) }; 
                                
                                    console.log('done');
                                    console.log(result);
                                }); 
                            });                   
                        });
                    });
                });
            });
        });
    });
};

doStuff(err => {
    console.log('There was an error: ' + err);
});
