'use strict';

module.exports = emitter => ({
  fetchAll: require('./fetch-all')(emitter),
  getList: require('./get-list')(emitter),
  getStatus: require('./get-status')(emitter),
  upload: require('./upload')(emitter)
});
