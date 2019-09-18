'use strict';

const _ = require('lodash');

module.exports = (config, readOctokit, writeOctokit) => {
  const utils = require('./utils')(config);
  return {
    create: (options, next) => {
      const createOptions = _.cloneDeep(options);
      const encodedContent = utils.encodeContent(createOptions.content);
      _.set(createOptions, 'content', encodedContent);

      writeOctokit.repos
        .createFile(createOptions)
        .then(({ data }) => next(null, data))
        .catch(err => {
          next(err);
        });
    },

    get: (options, next) => {
      readOctokit.repos
        .getContents(options)
        .then(({ data }) => {
          const getContent = f => new Buffer.from(f.content, f.encoding).toString();

          const content = data ? getContent(data) : null;
          const sha = data ? data.sha : null;
          const result = {
            content,
            sha
          };

          return next(null, result);
        })
        .catch(err => {
          return next(err, { content: null, sha: null });
        });
    },

    lastUpdated: (options, next) => {
      options['per_page'] = 1;
      readOctokit.repos
        .listCommits(options)
        .then(({ data }) => {
          if (_.isEmpty(data)) {
            return next('Empty commit data for manifest.json');
          }

          next(null, data[0].commit.author.date);
        })
        .catch(err => next(err));
    },

    update: (options, next) => {
      const updateOptions = _.cloneDeep(options);
      const encodedContent = utils.encodeContent(updateOptions.content);
      _.set(updateOptions, 'content', encodedContent);

      writeOctokit.repos
        .createOrUpdateFile(updateOptions)
        .then(({ data }) => next(null, data))
        .catch(err => {
          next(err);
        });
    }
  };
};
