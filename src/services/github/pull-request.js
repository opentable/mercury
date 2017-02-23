'use strict';

const _ 		= require('lodash');
const config 	= require('config');

module.exports = (github) => ({

    close: (options, next) => {
        options.state = 'closed';
        github.pullRequests.update(options, next);
    },

    create: github.pullRequests.create,

    get: (options, next) => {

        const prOptions = _.extend(_.cloneDeep(options), {
            head: `${config.github.owner}:${config.github.branch}`,
            per_page: 1,
            state: 'open'
        });

        github.pullRequests.getAll(prOptions, (err, prs) => {
            if(err){
                return next(err);
            } else if(_.isEmpty(prs)){
                return next(null, { found: false });
            }

            const pr = _.head(prs);

            next(null, {
                createdAt: pr.created_at,
                found: true,
                number: pr.number
            });
        });
    },

    update: github.pullRequests.update
});