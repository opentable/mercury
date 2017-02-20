'use strict';

module.exports = {
    closePullRequestIfOutdated: require('./close-pull-request-if-outdated'),
    diff: require('./diff'),
    ensureBranch: require('./ensure-branch'),
    ensureFork: require('./ensure-fork'),
	fetchAll: require('./fetch-all'),
	fetchPullRequestInfo: require('./fetch-pull-request-info'),
    handlePullRequest: require('./handle-pr')
};
