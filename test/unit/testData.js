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
    smartlingInfoMock: {
        projectId: '2249fadc3',
        projectName: 'Project 111',
        accountUid: '48ade9f989',
        sourceLocaleId: 'en-US',
        sourceLocaleDescription: 'English (United States)',
        archived : false,
        targetLocales: [
            {
               localeId: 'de-DE',
               description: 'German (Germany)',
               enabled: true
            }
        ]
    },
    smartlingInfoNoResultsMock: {
        targetLocales: [
            {
               localeId: 'de-DE',
               description: 'German (Germany)',
               enabled: false
            }
        ]
    },
    smartlingMockNew: {
        response: {
            data: { overWritten: false }
        }
    },
    smartlingMockExisting: {
        response: {
            data: { overWritten: true }
        }
    },
    preTranslationRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: ['test/github/path/*.json'] } } ]
        }
    },
    postTranslationRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: ['test/github/path/*.json'] } } ]
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
        ]
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
