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

console.log('>> Creating fork');

github.repos.fork(forkOptions, (err, fork) => {
    
    console.log('>> Getting master reference');

    const masterRefOptions = _.cloneDeep(baseOptions);
    masterRefOptions.ref = 'heads/master';

    github.gitdata.getReference(masterRefOptions, (err, masterReference) => {
        
        console.log('>> Getting branch reference');

        const branchRefOptions = _.cloneDeep(baseOptions);
        branchRefOptions.ref = referenceName;
        
        github.gitdata.getReference(branchRefOptions, (err, branchReference) => {

            console.log('>> Creating branch reference');

            const createReferenceOptions = _.cloneDeep(baseOptions);
            createReferenceOptions.ref = `refs/${referenceName}`;
            createReferenceOptions.sha = masterReference.object.sha;

            github.gitdata.createReference(createReferenceOptions, (err, branchReference) => {

                console.log('>> Getting commit');

                const getCommitOptions = _.cloneDeep(baseOptions);
                getCommitOptions.sha = branchReference.object.sha;
                
                github.gitdata.getCommit(getCommitOptions, (err, commit) => {
                    
                    console.log('>> Creating blob');

                    const parentCommitSha = commit.sha;
                    const baseTreeSha = commit.tree.sha;
                    const createBlobOptions = _.cloneDeep(baseOptions);
                    createBlobOptions.content = 'test file content';
                    createBlobOptions.encoding = 'utf-8';
                    
                    github.gitdata.createBlob(createBlobOptions, (err, blob) => {
                        
                        console.log('>> Getting tree');

                        const createdBlobSha = blob.sha;
                        const getBaseTreeOptions = _.cloneDeep(baseOptions);
                        getBaseTreeOptions.sha = baseTreeSha;
                        
                        github.gitdata.getTree(getBaseTreeOptions, (err, baseTree) => {
                            
                            console.log('>> Creating tree');

                            const createTreeOptions = _.cloneDeep(baseOptions);
                            createTreeOptions.base_tree = baseTreeSha;
                            createTreeOptions.tree = [];
                            createTreeOptions.tree.push({
                                path: 'test.txt',
                                mode: '100644',
                                type: 'blob',
                                sha: createdBlobSha 
                            });
                            
                            github.gitdata.createTree(createTreeOptions, (err, tree) => {
                                
                                console.log('>> Creating commit');

                                const createCommitOptions = _.cloneDeep(baseOptions);
                                createCommitOptions.message = 'test commit';
                                createCommitOptions.tree = tree.sha;
                                createCommitOptions.parents = [parentCommitSha];
                                
                                github.gitdata.createCommit(createCommitOptions, (err, newCommit) => {
                                    
                                    console.log('>> Pushing');

                                    const updateReferenceOptions = _.cloneDeep(baseOptions);
                                    updateReferenceOptions.ref = referenceName;
                                    updateReferenceOptions.sha = newCommit.sha;
                                    
                                    github.gitdata.updateReference(updateReferenceOptions, (err, result) => {
                                        console.log(err);
                                        console.log(result);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });    
    });

});
