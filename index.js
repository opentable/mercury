'use strict';

const app = require('./src/app');
const config = require('config');
const Logger = require('./src/services/logger-service');
const loggerService = Logger();

const mercury = app({ config });

mercury.on('result', (resultType, message) => {
  loggerService.info(message, resultType);
});

mercury.on('action', message => {
  loggerService.console(message);
});

mercury.on('error', (error, errorType, status) => {
  loggerService.error(error, errorType, status);
});

mercury.run(() => {
  process.exit(0);
});
