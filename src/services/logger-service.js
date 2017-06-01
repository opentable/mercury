const config = require('config');
const logger = require('ot-logger');

const opts   = {
    servicetype: 'mercury',
    formatversion: 'v1',
    environment: config.logging.environment
}

logger.init(opts);

const log = (type, msg, metadata) => {
    if(config.logging.logStash){
        logger.log(type, msg, metadata);
    }
}

module.exports = () => {

    const buildErrorMetaData = (error, errortype, options) => {
        return {
            errordetails: error || '',
            errortype,
            logname: 'error',
            path : options.path,
            failingrepository : options.repo,
            failingrepositoryowner: options.owner
        };
    };

    const buildInfoMetaData = (infotype) => {
        return {
            logname: 'info',
            infotype
        };
    };

    const error = (error, errorType, repository) => {
        const options = {
            repo: repository.repo,
            owner: repository.owner
        };

        const metadata = buildErrorMetaData(error, errorType, options);
        log('error', error.toString(), metadata);
    };

    const info = (msg, infoType) => {
        const metadata = buildInfoMetaData(infoType);
        log('info', msg, metadata);
    };

    const consoleLog = (msg) => {
        if(config.logging.console){
            console.log(`[${new Date()}] ${msg}`);
        }
    };

    return {
        console: consoleLog,
        error,
        info
    };
};
