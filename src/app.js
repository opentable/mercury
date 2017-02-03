'use strict';

const _ 		   = require('lodash');
const async  	   = require('async');
const config 	   = require('config');
const manifest 	   = require('./manifest');
const resources    = require('./resources');
const translations = require('./translations');

const processRepo = (repository, next) => {
	async.waterfall([

		cb => manifest.fetch(repository, cb),
		
		(repository, cb) => manifest.validate(repository, cb),
        
        (repository, cb) => translations.getList(repository, cb),
        
        (repository, cb) => translations.upload(repository, cb),

        (repository, cb) => translations.fetchAll(repository, cb),
        
        (repository, cb) => resources.fetchAll(repository, cb)
	
	], (err, repository) => {

		console.log(`\ngot following result for ${repository.owner}/${repository.repo}:`);
		console.log(err || JSON.stringify(repository, null, 2));
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
