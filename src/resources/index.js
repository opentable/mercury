'use strict';

module.exports = {
    diff: require('./diff'),
    ensureFork: require('./ensure-fork'),
	fetchAll: require('./fetch-all'),
	fetchPullRequestInfo: require('./fetch-pull-request-info'),
    handlePullRequest: require('./handle-pr')
};
