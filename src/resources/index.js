'use strict';

module.exports = loggerService => ({
  closePullRequestIfOutdated: require('./close-pull-request-if-outdated')(loggerService),
  commitFiles: require('./commit-files')(loggerService),
  deleteReferenceIfClosedPr: require('./delete-reference-if-closed-pr')(loggerService),
  ensureBranch: require('./ensure-branch')(loggerService),
  ensureFork: require('./ensure-fork')(loggerService),
  fetchAll: require('./fetch-all')(loggerService),
  fetchPullRequestInfo: require('./fetch-pull-request-info')(loggerService),
  fetchRequestRateStats: require('./fetch-request-rate-stats')(loggerService),
  handlePullRequest: require('./handle-pull-request')(loggerService)
});
