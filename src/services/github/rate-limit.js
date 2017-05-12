'use strict';

module.exports = (github) => ({

    get: (next) => {
        github.misc.getRateLimit({}, next);
    }
});
