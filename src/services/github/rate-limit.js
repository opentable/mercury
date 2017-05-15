'use strict';

const utils  = require('./utils');

module.exports = (github) => ({

    get: (next) => {
        
        const authenticatedGithub = utils.authenticateGithubOperation('write', github);
        
        authenticatedGithub.misc.getRateLimit({}, next);
    }
});
