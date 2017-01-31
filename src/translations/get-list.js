'use strict';

const _ 		= require('lodash');
const config 	= require('config');
const github 	= require('../services/github');
const Logger 	= require('../services/logger-service');
const mm 		= require('micromatch');
const path      = require('path');
const smartling = require('../services/smartling');

const loggerService = Logger();

const getMatchingFiles = (list, srcGlobs) => {
	let result = list;
    
	_.each(srcGlobs, glob => {
        result = mm.match(result, glob);
    });

	return mapFileObjects(result);
};

const mapFileObjects = (files) => {
    return _.map(files, file => ({
        github: file,
        smartling: `files/${path.basename(file)}`
    }));
};

module.exports = (repository, callback) => {
    
    // TODO: reiterate on each translation item

    const srcGlobs = _.first(repository.manifestContent.translations).input.src;

    const githubOptions = {
		apiToken: config.github.apiToken,
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
			loggerService.failedToLocateTranslationFilesInGithub(err, _.pick(githubOptions, ['repo', 'owner']));
			repository.skip = true;
			return callback(err, repository);
		} else {
			smartling.getProjectInfo(smartlingOptions, (err, info) => {
				if(err){
					err = new Error(`Failed to fetch smartling project info for ${githubOptions.owner}/${githubOptions.repo}. Skipping.`);
					loggerService.log(err, 'failed-smartling-fetch-info', repository);
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
