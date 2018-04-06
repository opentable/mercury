'use strict';

module.exports = options => ({
  closePullRequestIfOutdated: require('./close-pull-request-if-outdated')(options),
  commitFiles: require('./commit-files')(options),
  deleteReferenceIfClosedPr: require('./delete-reference-if-closed-pr')(options),
  ensureBranch: require('./ensure-branch')(options),
  ensureFork: require('./ensure-fork')(options),
  fetchAll: require('./fetch-all')(options),
  fetchPullRequestInfo: require('./fetch-pull-request-info')(options),
  fetchRequestRateStats: require('./fetch-request-rate-stats')(options),
  handlePullRequest: require('./handle-pull-request')(options)
});
