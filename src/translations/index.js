'use strict';

module.exports = loggerService => ({
  fetchAll: require('./fetch-all')(loggerService),
  getList: require('./get-list')(loggerService),
  getStatus: require('./get-status')(loggerService),
  upload: require('./upload')(loggerService)
});
