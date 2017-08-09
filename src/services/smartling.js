'use strict';

const _ = require('lodash');
const needle = require('needle');
const path = require('path');
const request = require('request');

const BASE_URL = 'https://api.smartling.com/';
const MAX_CONCURRENT_OPERATIONS = 20;

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
        const accessToken = _.get(body, 'response.data.accessToken');

        if (!accessToken) {
            return next(new Error(`Error when retrieving Smartling access token`))
        }

        next(err, accessToken);
    });
};

module.exports = {

    fetchFile: (options, next) => {
        authenticate(options, (err, accessToken) => {

            if (err) { return next(err); }

            const reqDetails = {
                url: `${BASE_URL}/files-api/v2/projects/${options.projectId}/locales/${options.localeId}/file?fileUri=${options.fileName}`,
                headers: { Authorization: `Bearer ${accessToken}` }
            };

            request(reqDetails, (err, response, body) => {
                if (err || response.statusCode !== 200) {
                    return next(new Error(`Error when downloading Smartling Resource (${response.statusCode} - ${JSON.stringify(body)})`));
                }

                next(null, body);
            });
        });
    },

    getProjectInfo: (options, next) => {
        authenticate(options, (err, accessToken) => {

            if (err) { return next(err); }

            const reqDetails = {
                url: `${BASE_URL}projects-api/v2/projects/${options.projectId}`,
                headers: { Authorization: `Bearer ${accessToken}` },
                json: true
            };

            request(reqDetails, (err, response, body) => {
                if (err || response.statusCode !== 200) {
                    return next(new Error(`Error when downloading Smartling project Info (${response.statusCode} - ${JSON.stringify(body)})`));
                }

                next(null, body.response.data);
            });
        });
    },

    getStatus: (options, next) => {
        authenticate(options, (err, accessToken) => {

            if (err) { return next(err); }

            const reqDetails = {
                url: `${BASE_URL}/files-api/v2/projects/${options.projectId}/file/status`,
                headers: { Authorization: `Bearer ${accessToken}` },
                qs: {
                    fileUri: options.fileUri
                },
                json: true
            };

            request(reqDetails, (err, response, body) => {
                if (err || response.statusCode !== 200) {
                    return next(new Error(`Error when downloading Smartling status info (${response.statusCode} - ${JSON.stringify(body)})`));
                }

                next(null, body.response.data);
            });
        });
    },

    MAX_CONCURRENT_OPERATIONS,

    uploadFileContent: (content, options, next) => {
        authenticate(options, (err, accessToken) => {

            if (err) {
                return next(err);
            }

            const buffer = Buffer.from(content);

            const smartlingFormData = {
                file: {
                    buffer,
                    filename: path.basename(options.path),
                    content_type: 'application/octet-stream'
                },
                fileUri: options.path,
                fileType: path.extname(options.path).replace('.', ''),
                authorize: 'true'
            };

            const smartlingUploadOptions = {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                multipart: true
            };

            needle.post(`${BASE_URL}files-api/v2/projects/${options.projectId}/file`, smartlingFormData, smartlingUploadOptions, function (err, response) {
                if (err || response.statusCode !== 200) {
                    return next(new Error('Error when uploading Smartling file'));
                }

                next(null, response.body);
            });
        });
    }
}
