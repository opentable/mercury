'use strict';

const joi 				= require('joi');
const LoggerService 	= require('../services/logger-service');

const loggerService = LoggerService();

const schema = joi.object().keys({
	smartlingProjectId: joi.string().required(),
	translations: joi.array().min(1).items(joi.object().keys({
		input: joi.object().keys({
			locale: joi.string().required(),
			src: joi.string().required()
		}).required(),
		output: joi.object().keys({
			src: joi.string().required()
		}).required()
	}).required()).required()
});

module.exports = (repository, callback) => {

	joi.validate(repository.manifestContent, schema, (err, normalisedManifest) => {
		if(err){

				const options = {
					path: 'mercury.json',
					repo: repository.repo,
					owner: repository.owner
				};

				loggerService.manifestFailedValidation(err, options);
		}

		if(!err && normalisedManifest){
			repository.manifestContent = normalisedManifest;
		}

		callback(err, repository);
	});
};
