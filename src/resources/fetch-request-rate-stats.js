'use strict';

module.exports = ({ emitter, config }) => callback => {
  const github = require('../services/github')(config);
  github.getRequestRateStats((err, stats) => {
    if (err) {
      err = new Error('Failed while fetching GitHub hourly rate limit status');
    }

    emitter.emit('action', { message: `GitHub rate limit stats for this hour: ${JSON.stringify(stats, null, 2)}` });
    callback();
  });
};
