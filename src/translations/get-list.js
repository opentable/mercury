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

		_.each(srcGlobs.src, glob => {
			result = mm.match(result, glob);
		});

		if(!_.isEmpty(result)){
			const srcToDestMap = _.map(result, file => ({ src: file, dest: srcGlobs.dest }));
			collection = _.union(collection, _.uniq(srcToDestMap));
		}
	});

	return mapFileObjects(_.uniq(collection));
};

const mapFileObjects = (files) => {

	return _.map(files, file => {

		let i = 0;
		const pathComponents = _.reverse(file.src.split(path.sep));
		let currentPath = '';

		while(i < pathComponents.length) {
			currentPath = '/' + pathComponents[i] + currentPath;
			const fileNames = _.map(files, singleFile => _.reverse(singleFile.src.split(path.sep))[i]);
			const areFilePathsUnique = _.uniq(fileNames).length === files.length;

			if(areFilePathsUnique) {
				return {
					dest: file.dest,
					github: file.src,
					smartling: i === 0 ? `/files${currentPath}` : currentPath
				};
			} else {
				i++;
			}
		}
	});
};

module.exports = (repository, callback) => {

	loggerService.info(`Getting translations' list from github for ${repository.owner}/${repository.repo}`);

	const srcGlobs = _.map(repository.manifestContent.translations, (item) => ({
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
