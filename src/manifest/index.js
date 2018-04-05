'use strict';

module.exports = emitter => ({
  fetch: require('./fetch')(emitter),
  validate: require('./validate')(emitter)
});
