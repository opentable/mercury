'use strict';

const _					= require('lodash');
const async			= require('async');
const config		= require('config');
const smartling = require('../services/smartling');

const getFullList = (repository) => {
	const list = [];

	_.each(repository.translationFiles, (file) => {
		_.each(repository.targetLocales, (localeId) => {
			list.push({ localeId, fileName: file.smartling });
		});
	});

	return list;
};

module.exports = (repository, callback) => {

	const smartlingOptions = {
		userIdentifier: config.smartling.userIdentifier,
		userSecret: config.smartling.userSecret,
		projectId: repository.manifestContent.smartlingProjectId
	};

  const filesToDownload = getFullList(repository);

  async.each(filesToDownload, (file, next) => {
	smartling.fetchFile(_.extend(smartlingOptions, file), (err, content) => {

		if(!err && content){
			let current = _.find(repository.translationFiles, { smartling: file.fileName });
			
			current.locales = current.locales || {};
			current.locales[file.localeId] = { smartlingContent: content };
		}

		next(err);
	});
  }, (err) => {

	if(err){
		repository.skip = true;
	}

	callback(err, repository);
  });
};
