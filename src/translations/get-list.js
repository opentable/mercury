'use strict';

const _ = require('lodash');
const config = require('config');
const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const mm = require('micromatch');
const smartling = require('../services/smartling');

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

module.exports = loggerService => (repository, callback) => {
  loggerService.console(`Getting translations' list from github for ${repository.owner}/${repository.repo}`);

  const srcGlobs = _.map(repository.manifestContent.translations, item => ({
    src: item.input.src,
    dest: item.output.dest
  }));

  const githubOptions = {
    repo: repository.repo,
    owner: repository.owner,
    branch: repository.manifestContent.workingBranch
  };

  const smartlingOptions = {
    userIdentifier: config.smartling.userIdentifier,
    userSecret: config.smartling.userSecret,
    projectId: repository.manifestContent.smartlingProjectId
  };

  github.getFilesList(githubOptions, (err, list) => {
    if (err) {
      err = new Error('No github files found. Skipping.');
      loggerService.error(err, errorTypes.failedToLocateTranslationFilesInGithub, repository);
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
        loggerService.error(err, errorTypes.failedToLocateTranslationFilesInGithub, repository);
        repository.skip = true;
        return callback(err, repository);
      }

      repository.translationFiles = translationFiles;

      smartling.getProjectInfo(smartlingOptions, (err, info) => {
        loggerService.console(`Getting project info from smartling for ${repository.owner}/${repository.repo}`);

        if (err) {
          loggerService.error(err, errorTypes.failedSmartlingFetchInfo, repository);
          repository.skip = true;
        } else {
          repository.sourceLocaleId = info.sourceLocaleId;
          repository.targetLocales = _.filter(info.targetLocales, {
            enabled: true
          }).map(x => x.localeId);
          if (_.isEmpty(repository.targetLocales)) {
            repository.skip = true;
          }
        }

        callback(err, repository);
      });
    });
  });
};
