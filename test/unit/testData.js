'use strict';

module.exports = {
    githubMock: [ 
        'test/github/path/file.json',
        'test/github/path/other-file.json'
    ],
    githubMockYml: [ 
        'test/github/path/file.json',
        'test/github/path/other-file.yml'
    ],
    preTranslationRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: ['test/github/path/*.json'] } } ]
        }
    },
    translationFiles: [ 
        {
            github: 'test/github/path/file.json',
            smartling: 'files/file.json'
        },
        {
            github: 'test/github/path/other-file.json',
            smartling: 'files/other-file.json'
        }
    ],
    translationFilesGlob: [
        {
            github: 'test/github/path/file.json',
            smartling: 'files/file.json'
        }
    ]
}
