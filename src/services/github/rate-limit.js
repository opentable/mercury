'use strict';

const async = require('async');
const config = require('config');

module.exports = github => ({
    get: next => {
        const options = {};
        const stats = {};

        let readIndex = 0;
        let writeIndex = 0;

        async.eachOfSeries(
            config.github.apiTokens,
            (token, index, next) => {
                github.authenticate({
                    type: 'oauth',
                    token: token.value
                });

                const operation = token.operation;

                operation === 'read' ? readIndex++ : writeIndex++;

                github.misc.getRateLimit(options, (err, rateLimit) => {
                    if (err) {
                        return next(err);
                    }

                    const requestsLimit = rateLimit.resources.core.limit;
                    const requestsRemaining = rateLimit.resources.core.remaining;
                    const requestsSent = requestsLimit - requestsRemaining;

                    stats[`mercurybot-${operation}-${operation === 'read' ? readIndex : writeIndex}-limit`] = requestsLimit;
                    stats[`mercurybot-${operation}-${operation === 'read' ? readIndex : writeIndex}-remaining`] = requestsRemaining;
                    stats[`mercurybot-${operation}-${operation === 'read' ? readIndex : writeIndex}-sent`] = requestsSent;

                    next();
                });
            },
            err => {
                if (err) {
                    return next(err);
                }

                next(err, stats);
            }
        );
    }
});
