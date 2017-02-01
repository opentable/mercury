'use strict';

const config 		= require('config');
const errorTypes 	= require('../resources/error-types');
const github 		= require('../services/github');
const LoggerService = require('../services/logger-service');

module.exports = (repository, callback) => {

	const loggerService = LoggerService();

	const options = {
		apiToken: config.github.apiToken,
		path: 'mercury.json',
		repo: repository.repo,
		owner: repository.owner
	};

	github.getFileContent(options, (err, content) => {
		if(!err && content){
			try {
				repository.manifestContent = JSON.parse(content);
			} catch(e){
				err = new Error('An error happened when parsing manifest.json');
				loggerService.error(err, errorTypes.failedToParseManifest, repository);
			repository.skip = true;
			}
		} else {
			err = new Error('manifest.json not found. Skipping.');
			loggerService.error(err, errorTypes.failedToLocateManifest, repository);
			repository.skip = true;
		}

		callback(err, repository);
	});
};
