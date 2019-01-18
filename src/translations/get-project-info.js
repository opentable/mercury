'use strict';

const _ = require('lodash');
const errorTypes = require('../constants/error-types');
const smartling = require('../services/smartling');

module.exports = ({ emitter, config }) => (repository, callback) => {
  const smartlingOptions = {
    userIdentifier: config.smartling.userIdentifier,
    userSecret: config.smartling.userSecret,
    projectId: repository.manifestContent.smartlingProjectId
  };

  smartling.getProjectInfo(smartlingOptions, (err, info) => {
    emitter.emit('action', { message: `Getting project info from smartling for ${repository.owner}/${repository.repo}` });

    if (err) {
      emitter.emit('error', { error: err, errorType: errorTypes.failedSmartlingFetchInfo, details: repository });
      repository.skip = true;
    } else {
      repository.sourceLocaleId = info.sourceLocaleId;
      repository.targetLocales = _.filter(info.targetLocales, {
        enabled: true
      }).map(x => x.localeId);
      if (_.isEmpty(repository.targetLocales)) {
        repository.skip = true;
      }
    }

    callback(err, repository);
  });
};
