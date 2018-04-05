'use strict';

module.exports = emitter => ({
  closePullRequestIfOutdated: require('./close-pull-request-if-outdated')(emitter),
  commitFiles: require('./commit-files')(emitter),
  deleteReferenceIfClosedPr: require('./delete-reference-if-closed-pr')(emitter),
  ensureBranch: require('./ensure-branch')(emitter),
  ensureFork: require('./ensure-fork')(emitter),
  fetchAll: require('./fetch-all')(emitter),
  fetchPullRequestInfo: require('./fetch-pull-request-info')(emitter),
  fetchRequestRateStats: require('./fetch-request-rate-stats')(emitter),
  handlePullRequest: require('./handle-pull-request')(emitter)
});
