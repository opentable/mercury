'use strict';

const request = require('request');

const authenticate = (options, next) => {
    const authenticateOptions = {
        url: 'https://api.smartling.com/auth-api/v2/authenticate',
        method: 'POST',
        json: true,
        body: {
            userIdentifier: options.userIdentifier,
            userSecret: options.userSecret
        }
    }
    
    request(authenticateOptions, (err, response, body) => {
        next(err, body.response.data.accessToken);
    });
};

module.exports = {
    getFileContent: (options, next) => {
        authenticate(options, (err, accessToken) => {
            
            if(err) {
                return next(err);
            }
            
            const getFileOptions = {
                url: `https://api.smartling.com/files-api/v2/projects/${options.projectId}/file?fileUri=/${options.path}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            };
            
            request(getFileOptions, (err, response, body) => {
                
                if(err || response.statusCode !== 200) {
                    return next('Impossible to retrieve Smartling file');
                }
                                
                next(null, body);
            });
        });
    }
}
