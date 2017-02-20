'use strict';

module.exports = {
    diff: require('./diff'),
    ensureBranch: require('./ensure-branch'),
    ensureFork: require('./ensure-fork'),
	fetchAll: require('./fetch-all'),
	fetchPullRequestInfo: require('./fetch-pull-request-info'),
    handlePullRequest: require('./handle-pr')
};
