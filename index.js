'use strict';

const app = require('./src/app');
const config = require('config');
const Logger = require('./src/services/logger-service');
const loggerService = Logger();

app({ config, loggerService });
