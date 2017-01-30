'use strict';

const path = require('path');
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
    uploadFileContent: (content, options, next) => {
        authenticate(options, (err, accessToken) => {
            
            if(err) {
                return next(err);
            }
                                    
            const smartlingFormData = {
                file: {
                    value: content,
                    options: {
                        filename: path.basename(options.path),
                        contentType: 'application/json'
                    }
                },
                fileUri: options.path,
                fileType: 'json'
            };

            const smartlingUploadOptions = {
                url: `https://api.smartling.com/files-api/v2/projects/${options.projectId}/file`,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                formData: smartlingFormData
            }
            
            request(smartlingUploadOptions, (err, response, body) => {
                                
                if(err || response.statusCode !== 200) {
                    return next(new Error('Error when uploading Smartling file'));
                }
                                
                next(null, JSON.parse(body));
            });
        });
    }
}
