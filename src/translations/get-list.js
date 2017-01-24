'use strict';

const _ = require('lodash');
const config = require('config');
const github = require('../services/github');
const parseGlob = require('parse-glob');

const createFilesList = (content) => {
    let list = [];
    content.forEach(file => {
        list.push(file.path);
    });
    return list;
}

module.exports = (repository, callback) => {
        
    const fullPath = _.first(repository.manifestContent.translations).input.src;
    
    const parsedPath = parseGlob(fullPath);
        
    const options = {
		apiToken: config.github.apiToken,
		path: parsedPath.base,
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
