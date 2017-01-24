'use strict';

const config 					= require('config');
const github 					= require('../services/github');
const LoggerService 	= require('../services/logger-service');

module.exports = (repository, callback) => {

	const loggerService = new LoggerService();

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
				loggerService.failedToParseManifest(err, {
					options.path,
					options.repo,
					options.owner
				});
			}
		} else {
			err = new Error('manifest.json not found. Skipping.');
		}

		if(err){
			repository.skip = true;
		}

		callback(err, repository);
	});
};
