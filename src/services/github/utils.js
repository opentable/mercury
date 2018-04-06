'use strict';

const _ = require('lodash');
const base64 = require('base-64');
const utf8 = require('utf8');

module.exports = config => ({
  authenticateGithubOperation: (operationType, github) => {
    const tokens = _.filter(config.github.apiTokens, ['operation', operationType]);

    const token = _.sample(tokens).value;

    github.authenticate({
      type: 'oauth',
      token
    });

    return github;
  },
  encodeContent: content => {
    const bytes = utf8.encode(content);
    const encoded = base64.encode(bytes);
    return encoded;
  }
});
