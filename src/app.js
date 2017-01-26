'use strict';

const _ 		   = require('lodash');
const async  	   = require('async');
const config 	   = require('config');
const manifest 	   = require('./manifest');
const translations = require('./translations');

const processRepo = (repository, next) => {
	async.waterfall([

		cb => manifest.fetch(repository, cb),
		
		(repository, cb) => manifest.validate(repository, cb),
        
        (repository, cb) => translations.getList(repository, cb),
        
        (repository, cb) => translations.upload(repository, cb)
	
	], (err, repository) => {

		console.log(`\ngot following result for ${repository.owner}/${repository.repo}:`);
		console.log(err || repository);
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
