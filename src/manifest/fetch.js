'use strict';

const errorTypes 	= require('../resources/error-types');
const github 		= require('../services/github');
const LoggerService = require('../services/logger-service');

module.exports = (repository, callback) => {

	const loggerService = LoggerService();

	const options = {
		path: 'mercury.json',
		repo: repository.repo,
		owner: repository.owner
	};

	github.getFileContent(options, (err, file) => {
		if(!err && file !== null){
			try {
				repository.manifestContent = JSON.parse(file.content);
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
