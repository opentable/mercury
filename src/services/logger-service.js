'use strict';

const config = require('config').logging;
const globalSchema = require('ot-loglov3-schemas');
const Logger = require('ot-logger');
const loggerEnvironment = require('./logger-environment');
const pkg = require('../../package.json');

const loggerInfo = loggerEnvironment.getEnvironmentInfo();

const logger = new Logger(
  {
    logstash: config.logStash,
    console: config.console,
    logstashEnvironment: loggerInfo.environment,
    globalSchema,
    throwValidationExceptions: config.throwValidationExceptions
  },
  {
    'component-id': 'mercury',
    'ot-env': `${loggerInfo.envType}-${loggerInfo.envLocation}`,
    'ot-env-type': loggerInfo.envType,
    'ot-env-location': loggerInfo.envLocation,
    'application-version': pkg.version,
    host: process.env.TASK_HOST || 'localhost',
    'service-type': 'mercury'
  }
);

const infoLogger = logger.create({
  '@loglov3-otl': 'mercury-info-v1',
  'log-name': 'info'
});

const errorLogger = logger.create({
  '@loglov3-otl': 'mercury-error-v1',
  'log-name': 'error'
});

module.exports = () => {
  const buildErrorMessage = (error, errorType, options) => {
    return {
      'error-type': errorType,
      path: options.path || '',
      'failing-repository': options.repo,
      'failing-repository-owner': options.owner,
      message: error.message || ''
    };
  };

  const buildInfoMessage = (msg, infoType) => {
    return {
      'info-type': infoType,
      message: msg
    };
  };

  const error = (error, errorType, repository) => {
    const options = {
      repo: repository.repo,
      owner: repository.owner
    };

    const message = buildErrorMessage(error, errorType, options);
    errorLogger.error(message);
  };

  const info = (msg, infoType) => {
    const message = buildInfoMessage(msg, infoType);
    infoLogger.info(message);
  };

  const consoleLog = msg => {
    if (config.console) {
      console.log(`[${new Date()}] ${msg}`);
    }
  };

  return {
    console: consoleLog,
    error,
    info
  };
};
