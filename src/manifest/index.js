'use strict';

module.exports = loggerService => ({
  fetch: require('./fetch')(loggerService),
  validate: require('./validate')(loggerService)
});
