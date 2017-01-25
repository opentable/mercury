'use strict';

const _             = require('lodash');
const config        = require('config');
const github        = require('../services/github');
const micromatch    = require('micromatch');
const parseGlob     = require('parse-glob');
const LoggerService = require('../services/logger-service');

const createFilesList = (content, fullPath) => {
    let list = [];

    content.forEach(file => {
        list.push(file.path);
    });

    return micromatch.match(list, fullPath);
}

module.exports = (repository, callback) => {

    const loggerService = LoggerService();

    const fullPath = _.first(repository.manifestContent.translations).input.src;
    const parsedPath = parseGlob(fullPath);
    const options = {
		apiToken: config.github.apiToken,
		path: parsedPath.base,
		repo: repository.repo,
		owner: repository.owner
	};

    github.getFilesList(options, (err, content) => {
		if(!err && content){
			repository.translationFiles = createFilesList(content, fullPath);
		} else {
			err = new Error('No translation files found. Skipping.');
      loggerService.failedToLocateTranslationFilesInGithub(err, _.pick(options, ['path', 'repo', 'owner']));
		}

		if(err){
			repository.skip = true;
		}

		callback(err, repository);
	});
};
