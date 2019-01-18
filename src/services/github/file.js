'use strict';

const _ = require('lodash');

module.exports = (config, github) => {
  const utils = require('./utils')(config);
  return {
    create: (options, next) => {
      const authenticatedGithub = utils.authenticateGithubOperation('write', github);
      const createOptions = _.cloneDeep(options);
      const encodedContent = utils.encodeContent(createOptions.content);
      _.set(createOptions, 'content', encodedContent);

      authenticatedGithub.repos.createFile(createOptions, (err, result) => {
        if (err) {
          return next(err);
        }
        next(null, result);
      });
    },

    get: (options, next) => {
      const authenticatedGithub = utils.authenticateGithubOperation('read', github);

      authenticatedGithub.repos.getContent(options, (err, file) => {
        const getContent = f => {
          try {
            return new Buffer(f.content, f.encoding).toString();
          } catch (error) {
            return next(error);
          }
        };
        const content = !err && file ? getContent(file) : null;
        const sha = !err && file ? file.sha : null;
        const result = {
          content,
          sha
        };
        return next(err, result);
      });
    },

    lastUpdated: (options, next) => {
      options['per_page'] = 1;
      const authenticatedGithub = utils.authenticateGithubOperation('read', github);

      authenticatedGithub.repos.getCommits(options, (err, commits) => {
        if (err || _.isEmpty(commits)) {
          return next(err);
        }

        next(null, commits[0].commit.author.date);
      });
    },

    update: (options, next) => {
      const authenticatedGithub = utils.authenticateGithubOperation('write', github);
      const updateOptions = _.cloneDeep(options);
      const encodedContent = utils.encodeContent(updateOptions.content);
      _.set(updateOptions, 'content', encodedContent);

      authenticatedGithub.repos.updateFile(updateOptions, (err, result) => {
        if (err) {
          return next(err);
        }
        next(null, result);
      });
    }
  };
};
