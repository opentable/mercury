'use strict';

const _ 		= require('lodash');
const config 	= require('config');

module.exports = (github) => ({

    get: (next) => {
        github.misc.getRateLimit({}, next);
    }
});
