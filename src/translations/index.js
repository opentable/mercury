'use strict';

module.exports = options => ({
  fetchAll: require('./fetch-all')(options),
  getList: require('./get-list')(options),
  getProjectInfo: require('./get-project-info')(options),
  getStatus: require('./get-status')(options),
  upload: require('./upload')(options)
});
