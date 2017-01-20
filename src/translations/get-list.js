'use strict';

const config = require('config');
const github = require('../services/github');

const createFilesList = (content) => {
    let list = [];
    content.forEach(file => {
        list.push(file.path);
    });
    return list;
}

module.exports = (repository, callback) => {
        
    const path = 'src/locales/en-us';
    
    const options = {
		apiToken: config.github.apiToken,
		path,
		repo: repository.repo,
		owner: repository.owner
	};
    
    github.getFilesList(options, (err, content) => {
		if(!err && content){
			repository.translationFiles = createFilesList(content);
		} else {
			err = new Error('No translation files found. Skipping.');
		}

		if(err){
			repository.skip = true;
		}

		callback(err, repository);
	});
};
