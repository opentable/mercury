'use strict';

const async = require('async');
const Octokit = require('@octokit/rest');

module.exports = config => ({
  get: next => {
    const options = {};
    const stats = {};

    let readIndex = 0;
    let writeIndex = 0;
    let octokit;

    async.eachOfSeries(
      config.github.apiTokens,
      (token, index, next) => {
        octokit = new Octokit({
          auth: () => {
            return token.value;
          },
          baseUrl: 'https://api.github.com',
          userAgent: 'mercury'
        });

        const operation = token.operation;

        operation === 'read' ? readIndex++ : writeIndex++;

        octokit.rateLimit
          .get(options)
          .then(({ data }) => {
            const requestsLimit = data.resources.core.limit;
            const requestsRemaining = data.resources.core.remaining;
            const requestsSent = requestsLimit - requestsRemaining;

            stats[`mercurybot-${operation}-${operation === 'read' ? readIndex : writeIndex}-limit`] = requestsLimit;
            stats[`mercurybot-${operation}-${operation === 'read' ? readIndex : writeIndex}-remaining`] = requestsRemaining;
            stats[`mercurybot-${operation}-${operation === 'read' ? readIndex : writeIndex}-sent`] = requestsSent;

            return next();
          })
          .catch(err => next(err));
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
