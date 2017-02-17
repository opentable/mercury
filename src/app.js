'use strict';

const _ 		   = require('lodash');
const async  	   = require('async');
const config 	   = require('config');
const manifest 	   = require('./manifest');
const resources    = require('./resources');
const translations = require('./translations');

const processRepo = (repository, next) => {

	const mercury = async.seq(
		manifest.fetch,
		manifest.validate,
		translations.getList,
		translations.upload,
		translations.fetchAll,
		translations.getStatus,
		resources.fetchAll,
		resources.diff,
        resources.ensureFork,
		resources.handlePullRequest
	);

	mercury(repository, (err, repository) => {
		console.log(`\ngot following result for ${repository.owner}/${repository.repo}:`);
		console.log(JSON.stringify(err, null, 2));
        console.log(JSON.stringify(repository, null, 2));
		next();
	});
};

_.each(config.repositories, (repositories, owner) => {
	async.eachSeries(repositories, (repo, next) => {

		processRepo({ owner, repo }, next);
		
	}, () => {

		const date = new Date();
		console.log(`\n\nMercury just ran - ${date}`);
		process.exit(0);
	});
});
