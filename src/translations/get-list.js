'use strict';

const _ 		= require('lodash');
const config 	= require('config');
const github 	= require('../services/github');
const LoggerService = require('../services/logger-service');
const mm 		= require('micromatch');

const loggerService = LoggerService();

const getMatchingFiles = (list, srcGlobs) => {
	let result = list;
	_.each(srcGlobs, glob => result = mm.match(result, glob));
	return result;
};

module.exports = (repository, callback) => {
    
    // TODO: reiterate on each translation item
    const srcGlobs = _.first(repository.manifestContent.translations).input.src;

    const options = {
		apiToken: config.github.apiToken,
		repo: repository.repo,
		owner: repository.owner
	};

    github.getFilesList(options, (err, list) => {
		if(!err && list){
			repository.translationFiles = getMatchingFiles(list, srcGlobs);
			if(_.isEmpty(repository.translationFiles)){
				err = true;
			}
		}

		if(err){
			err = new Error('No translation files found. Skipping.');
			loggerService.failedToLocateTranslationFilesInGithub(err, _.pick(options, ['path', 'repo', 'owner']));
			repository.skip = true;
		}

		callback(err, repository);
	});
};
