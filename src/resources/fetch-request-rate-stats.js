'use strict';

const github = require('../services/github');
const Logger = require('../services/logger-service');
const loggerService = Logger();

module.exports = callback => {
    github.getRequestRateStats((err, stats) => {
        if (err) {
            err = new Error('Failed while fetching GitHub hourly rate limit status');
        }

        loggerService.console(`GitHub rate limit stats for this hour: ${JSON.stringify(stats, null, 2)}`);

        callback();
    });
};
