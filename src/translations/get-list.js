'use strict';

const _ = require('lodash');
const errorTypes = require('../constants/error-types');
const mm = require('micromatch');

const getMatchingFiles = (list, srcGlobsCollection, callback) => {
  let collection = [];

  _.each(srcGlobsCollection, srcGlobs => {
    let result = list;

    _.each(srcGlobs.src, glob => {
      result = mm.match(result, glob);
    });

    if (!_.isEmpty(result)) {
      const srcToDestMap = _.map(result, file => ({
        src: file,
        dest: srcGlobs.dest
      }));
      collection = _.union(collection, _.uniq(srcToDestMap));
    }
  });

  const mappedFileObjects = mapFileObjects(collection);

  return callback(mappedFileObjects);
};

const mapFileObjects = files => {
  return _.map(files, file => ({ dest: file.dest, src: file.src }));
};

module.exports = ({ emitter, config }) => (repository, callback) => {
  emitter.emit('action', { message: `Getting translations' list from github for ${repository.owner}/${repository.repo}` });

  const srcGlobs = _.map(repository.manifestContent.translations, item => ({
    src: item.input.src,
    dest: item.output.dest
  }));

  const githubOptions = {
    repo: repository.repo,
    owner: repository.owner,
    branch: repository.manifestContent.workingBranch
  };

  const github = require('../services/github')(config);

  github.getFilesList(githubOptions, (err, list) => {
    if (err) {
      err = new Error('No github files found. Skipping.');
      emitter.emit('error', { error: err, errorType: errorTypes.failedToLocateTranslationFilesInGithub, details: repository });
      repository.skip = true;
      return callback(err, repository);
    }

    getMatchingFiles(list, srcGlobs, translationFiles => {
      let matchingError;

      if (_.isEmpty(translationFiles)) {
        matchingError = 'No source files found. Skipping.';
      } else if (_.uniqBy(translationFiles, 'src').length !== translationFiles.length) {
        matchingError = 'Duplicate source paths found, check mercury file. Skipping';
      }

      if (matchingError) {
        err = new Error(matchingError);
        emitter.emit('error', { error: err, errorType: errorTypes.failedToLocateTranslationFilesInGithub, details: repository });
        repository.skip = true;
        return callback(err, repository);
      }

      repository.translationFiles = translationFiles;

      callback(err, repository);
    });
  });
};
