'use strict';

const _ 		= require('lodash');
const async  	= require('async');
const config 	= require('config');
const github 	= require('./services/github');

_.each(config.repositories, (repositories, owner) => {
	async.each(repositories, (repo, next) => {

		const options = {
			apiToken: config.github.apiToken,
			path: 'mercury.json',
			repo,
			owner
		};

		github.getFileContent(options, (err, result) => {
			console.log(`got following result for ${owner}/${repo}:`);
			console.log(err || result);
			next(err);
		});
		
	}, (err) => {
		const date = new Date();
		console.log(`Mercury just ran - ${date}`);
		process.exit(err ? 1 : 0);
	});
});
