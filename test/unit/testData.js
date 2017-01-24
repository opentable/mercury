'use strict';

module.exports = {
    githubMock: [ 
        { 
            path: 'test/github/path/file.json',
            name: 'file.json' 
        }, 
        { 
            path: 'test/github/path/other-file.json',
            name: 'other-file.json' 
        }
    ],
    githubMockYml: [ 
        { 
            path: 'test/github/path/file.json',
            name: 'file.json' 
        }, 
        { 
            path: 'test/github/path/other-file.yml',
            name: 'other-file.yml' 
        }
    ],
    preTranslationRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: 'test/github/path/*.json' } } ]
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
