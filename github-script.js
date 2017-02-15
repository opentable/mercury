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

const content = 'test file content';

const doStuff = callback => {

    service.ensureFork(err => {
        if(err) { return callback(err); }

        service.getMasterReference((err, masterReferenceSha) => {
            if(err) { return callback(err); }

            service.ensureBranchReference(masterReferenceSha, (err) => {
                if(err) { return callback(err); }
                
                service.upsertFile(content, (err) => {
                    if(err) { return callback(err); }                    
                    
                    service.ensurePullRequest((err, result) => {
                        if(err) { return callback(err); }
                        
                        console.log(err);
                        console.log(result);
                    });
                });
            });
        });
    });
};

doStuff(err => {
    console.log('There was an error: ' + err);
});
