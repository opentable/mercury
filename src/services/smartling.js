'use strict';

const _ = require('lodash');
const mapSmartlingFiletype = require('../utils/map-smartling-filetype');
const needle = require('needle');
const path = require('path');

const BASE_URL = 'https://api.smartling.com/';
const MAX_CONCURRENT_OPERATIONS = 20;

const authenticate = (options, next) => {
    const authenticateBody = {
        userIdentifier: options.userIdentifier,
        userSecret: options.userSecret
    };

    const reqDetails = {
        json: true
    }

    needle.post(`${BASE_URL}auth-api/v2/authenticate`, authenticateBody, reqDetails, (err, response, body) => {

        const accessToken = _.get(body, 'response.data.accessToken');

        if (!accessToken) {
            return next(new Error(`Error when retrieving Smartling access token`));
        }

        next(err, accessToken);
    });
};

module.exports = {

    fetchFile: (options, next) => {
        authenticate(options, (err, accessToken) => {

            if (err) { return next(err); }

            const reqDetails = {
                headers: { Authorization: `Bearer ${accessToken}` }
            };

            needle.get(`${BASE_URL}/files-api/v2/projects/${options.projectId}/locales/${options.localeId}/file?fileUri=${options.fileName}`, reqDetails, (err, response, body) => {
                if (err || response.statusCode !== 200) {
                    return next(new Error(`Error when retrieving translations content for ${options.fileName}`));
                }

                next(null, body.toString());
            });
        });
    },

    getProjectInfo: (options, next) => {
        authenticate(options, (err, accessToken) => {

            if (err) { return next(err); }

            const reqDetails = {
                headers: { Authorization: `Bearer ${accessToken}` }
            };

            needle.get(`${BASE_URL}projects-api/v2/projects/${options.projectId}`, reqDetails, (err, response, body) => {

                const info = _.get(body, 'response.data');

                if (err || !info || response.statusCode !== 200) {
                    return next(new Error(`Error when retrieving Smartling project info for ${options.projectId}`));
                }

                next(null, info);
            });
        });
    },

    getStatus: (options, next) => {
        authenticate(options, (err, accessToken) => {

            if (err) { return next(err); }

            const queryString = { 
                fileUri: options.fileUri 
            };

            const reqDetails = {
                headers: { Authorization: `Bearer ${accessToken}` }
            };

            needle.request('get', `${BASE_URL}/files-api/v2/projects/${options.projectId}/file/status`, queryString, reqDetails, (err, response, body) => {

                const status = _.get(body, 'response.data');

                if (err || !status || response.statusCode !== 200) {
                    return next(new Error(`Error when retrieving translation status for ${options.fileUri}`));
                }

                next(null, status);
            });
        });
    },

    MAX_CONCURRENT_OPERATIONS,

    uploadFileContent: (content, options, next) => {
        authenticate(options, (err, accessToken) => {

            if (err || !content) {
                const error = !content ? new Error(`Error when uploading Smartling file with null content`) : err;
                return next(error);
            }

            const buffer = Buffer.from(content);
            const filename = path.basename(options.path);
            const extension = path.extname(options.path).replace('.', '');
            const smartlingFormData = {
                file: {
                    buffer,
                    filename,
                    content_type: 'application/octet-stream'
                },
                fileUri: options.path,
                fileType: mapSmartlingFiletype.map(extension),
                authorize: 'true'
            };

            const smartlingUploadOptions = {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                multipart: true
            };

            needle.post(`${BASE_URL}files-api/v2/projects/${options.projectId}/file`, smartlingFormData, smartlingUploadOptions, function (err, response, body) {

                if (err || response.statusCode !== 200) {
                    return next(new Error(`Error when uploading Smartling file`));
                }

                next(null, body);
            });
        });
    }
}
