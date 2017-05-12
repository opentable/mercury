'use strict';

const github         = require('../services/github');
const Logger         = require('../services/logger-service');
const loggerService = Logger();

module.exports = (callback) => {

    loggerService.info(`Getting GitHub hourly rate limit status`);
    
    github.getRequestRateStats((err, stats) => {
        
        if(err){
            err = new Error('Failed while fetching GitHub hourly rate limit status');
        } else {
            
            const requestsLimit = stats.resources.core.limit;
            const requestsRemaining = stats.resources.core.remaining;
            const requestsSent = requestsLimit - requestsRemaining;
            
            loggerService.info(`Requests sent in this hour: ${requestsSent}`);
            loggerService.info(`Remaining requests for the hour: ${requestsRemaining}`);
        }

        callback();
    });
};
