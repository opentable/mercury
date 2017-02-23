'use strict';

module.exports = (github) => {

	const getReference = (options, next) => {

        options.ref = `heads/${options.branch}`;

        github.gitdata.getReference(options, (err, reference) => {
            next(err, reference ? reference.object.sha : undefined);
        });
    };

	const getOrCreate = (options, sourceSha, next) => {

        getReference(options, (err, branchReferenceSha) => {

            if(branchReferenceSha) {
                return next(err, branchReferenceSha);
            }
            
            options.ref = `refs/heads/${options.branch}`;
            options.sha = sourceSha;

            github.gitdata.createReference(options, (err, branchReference) => {
                if(err) { return next(err); }
                next(null, branchReference.object.sha);
            });
        });
    };

    const update = (options, next) => {
        options.ref = `heads/${options.branch}`;
        options.sha = options.reference;
        github.gitdata.updateReference(options, next);
    };

	return {
		get: getReference,
		getOrCreate,
        update
	};
};
