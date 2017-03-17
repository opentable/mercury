'use strict';

const path      = require('path');
const request   = require('request');

const BASE_URL = 'https://api.smartling.com/';

const authenticate = (options, next) => {
    const authenticateOptions = {
        url: `${BASE_URL}auth-api/v2/authenticate`,
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

    fetchFile: (options, next) => {
        authenticate(options, (err, accessToken) => {

            if(err){ return next(err); }

            const reqDetails = {
                url: `${BASE_URL}/files-api/v2/projects/${options.projectId}/locales/${options.localeId}/file?fileUri=${options.fileName}`,
                headers: { Authorization: `Bearer ${accessToken}` }
            };

            request(reqDetails, (err, response, body) => {
                if(err || response.statusCode !== 200) {
                    return next(new Error(`Error when downloading Smartling Resource (${response.statusCode} - ${JSON.stringify(body)})`));
                }
                                
                next(null, body);
            });
        });
    },

    getProjectInfo: (options, next) => {
        authenticate(options, (err, accessToken) => {

            if(err){ return next(err); }

            const reqDetails = {
                url: `${BASE_URL}projects-api/v2/projects/${options.projectId}`,
                headers: { Authorization: `Bearer ${accessToken}` },
                json: true
            };

            request(reqDetails, (err, response, body) => {
                if(err || response.statusCode !== 200) {
                    return next(new Error('Error when downloading Smartling project Info (${response.statusCode} - ${JSON.stringify(body)})'));
                }
                                
                next(null, body.response.data);
            });
        });
    },
    
    getStatus: (options, next) => {
        authenticate(options, (err, accessToken) => {
            
            if(err){ return next(err); }

            const reqDetails = {
                url: `${BASE_URL}/files-api/v2/projects/${options.projectId}/file/status`,
                headers: { Authorization: `Bearer ${accessToken}` },
                qs: {
                    fileUri: options.fileUri
                },
                json: true
            };
            
            request(reqDetails, (err, response, body) => {
                if(err || response.statusCode !== 200) {
                    return next(new Error('Error when downloading Smartling status info (${response.statusCode} - ${JSON.stringify(body)})'));
                }
                                
                next(null, body.response.data);
            });
        });
    },

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
                fileType: path.extname(options.path).replace('.', ''),
                authorize: 'true'
            };

            const smartlingUploadOptions = {
                url: `${BASE_URL}files-api/v2/projects/${options.projectId}/file`,
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
