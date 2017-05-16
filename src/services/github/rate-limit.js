'use strict';

const async  = require('async');
const config = require('config');

module.exports = (github) => ({

    get: (next) => {

        const stats = {};
        const options = {};

        async.eachOfSeries(config.github.readApiTokens, (token, index, next) => {

            github.authenticate({
                type: 'oauth',
                token
            });

            github.misc.getRateLimit(options, (err, rateLimit) => {

                if(err) {
                    return next(err);
                }

                const requestsLimit = rateLimit.resources.core.limit;
                const requestsRemaining = rateLimit.resources.core.remaining;
                const requestsSent = requestsLimit - requestsRemaining;

                stats[`mercury-bot-${index + 1}-limit`] = requestsLimit;
                stats[`mercury-bot-${index + 1}-remaining`] = requestsRemaining;
                stats[`mercury-bot-${index + 1}-sent`] = requestsSent;

                next();
            });

        }, (err) => {

            if(err) {
                return next(err);
            }

            github.authenticate({
                type: 'oauth',
                token: config.github.writeApiToken
            });

            github.misc.getRateLimit(options, (err, rateLimit) => {

                if(err) {
                    return next(err);
                }

                const requestsLimit = rateLimit.resources.core.limit;
                const requestsRemaining = rateLimit.resources.core.remaining;
                const requestsSent = requestsLimit - requestsRemaining;

                stats[`mercury-write-limit`] = requestsLimit;
                stats[`mercury-write-remaining`] = requestsRemaining;
                stats[`mercury-write-sent`] = requestsSent;

                next(err, stats);
            });
        });
    }
});
