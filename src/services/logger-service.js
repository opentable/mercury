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

    const failedToParseManifest = (error, options) => {
        const msg = `Error while parsing ${options.path} from ${options.repo}`;
        const errorType = 'failed-to-parse-manifest';

        const metadata = buildMetaData(error, errorType, options);

        log('error', msg, metadata);
    };

    const failedToLocateManifest = (error, options) => {
        const msg = `Error while locating manifest ${options.path} from ${options.repo}`;
        const errorType = 'failed-to-locate-manifest';

        const metadata = buildMetaData(error, errorType, options);

        log('error', msg, metadata);
    };

    const manifestFailedValidation = (error, options) => {

        const msg = `Error manifest failed validation - ${options.path} from ${options.repo}`;
        const errorType = 'manifest-failed-validation';

        const metadata = buildMetaData(error, errorType, options);

        log('error', msg, metadata);
    };

    const failedToLocateTranslationFilesInGithub = (error, options) => {

        const msg = `Error Failed to locate translate files in github - ${options.path} from ${options.repo}`;
        const errorType = 'failed-to-location-translation-files-in-github';

        const metadata = buildMetaData(error, errorType, options);

        log('error', msg, metadata);
    };

    const logGeneric = (error, errorType, repository) => {
        const options = {
            repo: repository.repo,
            owner: repository.owner
        };

        const metadata = buildMetaData(error, errorType, options);
        log('error', error.toString(), metadata);
    };

    return {
        failedToParseManifest,
        failedToLocateManifest,
        log: logGeneric,
        manifestFailedValidation,
        failedToLocateTranslationFilesInGithub
    };
};
