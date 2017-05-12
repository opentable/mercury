'use strict';

const _             = require('lodash');
const errorTypes    = require('../constants/error-types');
const joi           = require('joi');
const LoggerService = require('../services/logger-service');

const notEmptyArray = joi.array().min(1);
const loggerService = LoggerService();

const schema = joi.object().keys({
    workingBranch: joi.string().min(1).default('master'),
    smartlingProjectId: joi.string().length(9).required(),
    translations: notEmptyArray.items(joi.object().keys({
        input: joi.object().keys({
            src: joi.any().allow(joi.string(), notEmptyArray.items(joi.string())).required()
        }).required(),
        output: joi.object().keys({
            dest: joi.string().regex(/locale/).required()
        }).required()
    }).required()).required()
});

module.exports = (repository, callback) => {

    loggerService.info(`Validating manifest for ${repository.owner}/${repository.repo}`);

    joi.validate(repository.manifestContent, schema, (err, normalisedManifest) => {

        if(err){
            loggerService.error(new Error('Manifest is not valid'), errorTypes.manifestFailedValidation, repository);
        }

        if(!err && normalisedManifest){

            _.each(normalisedManifest.translations, (translation) => {
                translation.input.src = _.isArray(translation.input.src) ? translation.input.src : [translation.input.src];
            });

            repository.manifestContent = normalisedManifest;
        }

        callback(err, repository);
    });
};
