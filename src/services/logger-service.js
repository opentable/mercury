const config = require('config');
const logger = require('ot-logger');

const opts   = {
    servicetype: 'mercury',
    formatversion: 'v1',
    environment: config.Logging.environment
}

logger.init(opts);

const log = (type, msg, metadata) => {
    if(config.Logging.shouldLog){
        logger.log(type, msg, metadata);
    }
}

module.exports = () => {

    const buildMetaData = (error, errortype, options) => {
        return {
            errordetails: error || '',
            errortype,
            logname: 'error',
            path : options.path,
            failingrepository : options.repo,
            failingrepositoryowner: options.owner
        };
    };

    const error = (error, errorType, repository) => {
        const options = {
            repo: repository.repo,
            owner: repository.owner
        };

        const metadata = buildMetaData(error, errorType, options);
        log('error', error.toString(), metadata);
    };

    const info = (msg) => console.log(`[${new Date()}] ${msg}`);

    return {
        error,
        info
    };
};
