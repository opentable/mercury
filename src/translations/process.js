'use strict';

module.exports = (repository, callback) => {
    console.log(repository.translationFiles);
    callback(null, repository);
}
