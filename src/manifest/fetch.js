'use strict';

const config 	= require('config');
const github 	= require('../services/github');

module.exports = (repository, callback) => {

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
