'use strict';

module.exports = options => ({
  fetch: require('./fetch')(options),
  validate: require('./validate')(options)
});
