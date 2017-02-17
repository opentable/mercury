'use strict';

const _ 			= require('lodash');
const config 		= require('config');
const errorTypes 	= require('../constants/error-types');
const github 		= require('../services/github');
const Logger 		= require('../services/logger-service');
const mm 			= require('micromatch');
const path      	= require('path');
const smartling 	= require('../services/smartling');

const loggerService = Logger();

const getMatchingFiles = (list, srcGlobsCollection) => {
	let collection = [];

	_.each(srcGlobsCollection, srcGlobs => {

		let result = list;
		
		_.each(srcGlobs, glob => {
			result = mm.match(result, glob);
		});

		collection = _.union(collection, result);
	});

	return mapFileObjects(_.uniq(collection));
};

const mapFileObjects = (files) => {
	return _.map(files, file => ({
		github: file,
		smartling: `files/${path.basename(file)}`
	}));
};

module.exports = (repository, callback) => {

	loggerService.info(`Getting translations' list from github for ${repository.owner}/${repository.repo}`);

	const srcGlobs = _.map(repository.manifestContent.translations, item => item.input.src);

	const githubOptions = {
		repo: repository.repo,
		owner: repository.owner
	};

	const smartlingOptions = {
		userIdentifier: config.smartling.userIdentifier,
		userSecret: config.smartling.userSecret,
		projectId: repository.manifestContent.smartlingProjectId 
	};

	github.getFilesList(githubOptions, (err, list) => {

		if(!err && list){
			repository.translationFiles = getMatchingFiles(list, srcGlobs);
			
			if(_.isEmpty(repository.translationFiles)){
				err = true;
			}
		}

		if(err){
			err = new Error('No translation files found. Skipping.');
			loggerService.error(err, errorTypes.failedToLocateTranslationFilesInGithub, repository);
			repository.skip = true;
			return callback(err, repository);
		} else {
			smartling.getProjectInfo(smartlingOptions, (err, info) => {

				loggerService.info(`Getting project info from smartling for ${repository.owner}/${repository.repo}`);

				if(err){
					loggerService.error(err, errorTypes.failedSmartlingFetchInfo, repository);
					repository.skip = true;
				} else {
					repository.sourceLocaleId = info.sourceLocaleId;
					repository.targetLocales = _.filter(info.targetLocales, { enabled: true }).map(x => x.localeId);
					if(_.isEmpty(repository.targetLocales)){
						repository.skip = true;
					}
				}
		
				callback(err, repository);
			});
		}
	});
};
