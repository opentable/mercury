const _      = require('lodash');
const config = require('config');
const logger = require('ot-logger');

const opts   = {
	servicetype: 'mercury',
	formatversion: 'v1',
	environment: config.Logging.environment
}

logger.init(opts);

module.exports = () => {

	const failedToParseManifest = (error, options) => {

		const msg = `Error while parsing ${options.path} from ${options.repo}`;

		const metadata = {
			errordetails: error || '',
			errortype: 'failed-to-parse-manifest',
			logname: 'error',
			path : options.path,
			failingrepository : options.repo,
      failingrepositoryowner: options.owner
		};

    console.log(`debug out the metadata: ${metadata}`);

		logger.log('error', msg, metadata);
	};

	return {
		failedRequest
	};
};
