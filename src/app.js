'use strict';

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
        resources.ensureFork,
        resources.fetchPullRequestInfo,
        resources.closePullRequestIfOutdated,
        resources.deleteReferenceIfClosedPr,
        resources.ensureBranch,
        resources.commitFiles,
		resources.handlePullRequest
	);

	mercury(repository, (err, repository) => {
		if(err) {
            console.log(`\ngot an error while processing ${repository.owner}/${repository.repo}:`);
            console.log(err);
        }
		next();
	});
};

async.eachOfSeries(config.repositories, (repositories, owner, next) => {
	async.eachSeries(repositories, (repo, next) => {

		processRepo({ owner, repo }, next);
		
	}, next);
}, () => {
    const date = new Date();
    resources.fetchRequestRateStats(() => {
        console.log(`\n\nMercury just ran - ${date}`);
        process.exit(0);
    });
});
