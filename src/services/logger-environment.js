'use strict';

const getEnvironmentInfo = () => {
    let environment, envType, envLocation;

    switch ((process.env.NODE_ENV || '').toLowerCase()) {
    case 'ci-sf':
        environment = 'qa-sf';
        envType = 'ci';
        envLocation = 'sf';
        break;
    case 'ci-uswest2':
        environment = 'qa-uswest2';
        envType = 'ci';
        envLocation = 'uswest2';
        break;
    case 'pp-sf':
        environment = 'qa-sf';
        envType = 'pp';
        envLocation = 'sf';
        break;
    case 'pp-uswest2':
        environment = 'qa-uswest2';
        envType = 'pp';
        envLocation = 'uswest2';
        break;
    case 'prod-sc':
    case 'prod-uswest2':
    case 'prod-ln':
    case 'prod-euwest1':
        environment = process.env.NODE_ENV.toLowerCase();
        envType = process.env.NODE_ENV.toLowerCase().split('-')[0];
        envLocation = process.env.NODE_ENV.toLowerCase().split('-')[1];
        break;
    default:
        environment = 'qa-sf';
        envType = 'development';
        envLocation = 'local';
        break;
    }

    return {
        environment,
        envType,
        envLocation
    };
};

module.exports = {
    getEnvironmentInfo
};
