'use strict';

module.exports = {
    githubMock: [ 
        'src/locales/en-us/file.json',
        'src/locales/en-us/other-file.json'
    ],
    githubMockYml: [ 
        'src/locales/en-us/file.json',
        'src/locales/en-us/other-file.yml'
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
            translations: [ { input: { src: ['src/locales/en-us/*.json'] }, output: { dest: 'src/locales/${locale}/${filename}' } } ]
        }
    },
    postSourceFetchRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: ['src/locales/en-us/*.json'] }, output: { dest: 'src/locales/${locale}/${filename}' } } ]
        },
        translationFiles: [ 
            {
                github: 'src/locales/en-us/file.json',
                smartling: 'files/file.json',
                report: 'Test repo report'
            },
            {
                github: 'src/locales/en-us/other-file.json',
                smartling: 'files/other-file.json',
                report: 'Test repo report'
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL']
    },
    postSmartlingFetchRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: ['src/locales/en-us/*.json'] }, output: { dest: 'src/locales/${locale}/${filename}' } } ]
        },
        translationFiles: [ 
            {
                github: 'src/locales/en-us/file.json',
                smartling: 'files/file.json',
                report: 'Test repo report',
                locales: {
                    'de-DE': { smartlingContent: 'file content' },
                    'nl-NL': { smartlingContent: 'file content' }
                }
            },
            {
                github: 'src/locales/en-us/other-file.json',
                report: 'Test repo report',
                smartling: 'files/other-file.json',
                locales: {
                    'de-DE': { smartlingContent: 'file content' },
                    'nl-NL': { smartlingContent: 'file content' }
                }
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL']
    },
    postSmartlingStatusFetchRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: ['src/locales/en-us/*.json'] }, output: { dest: 'src/locales/${locale}/${filename}' } } ]
        },
        translationFiles: [ 
            {
                github: 'src/locales/en-us/file.json',
                smartling: 'files/file.json',
                report: 'Test repo report',
                totalStringCount: 1,
                totalWordCount: 2,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { authorizedStringCount: 1, authorizedWordCount: 2, completedStringCount: 0, completedWordCount: 0 } 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { authorizedStringCount: 1, authorizedWordCount: 2, completedStringCount: 1, completedWordCount: 2 } 
                    }
                }
            },
            {
                github: 'src/locales/en-us/other-file.json',
                report: 'Test repo report',
                smartling: 'files/other-file.json',
                totalStringCount: 1,
                totalWordCount: 2,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { authorizedStringCount: 1, authorizedWordCount: 2, completedStringCount: 0, completedWordCount: 0 } 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { authorizedStringCount: 1, authorizedWordCount: 2, completedStringCount: 1, completedWordCount: 2 } 
                    }
                }
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL']
    },
    postGithubFetchRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: ['src/locales/en-us/*.json'] }, output: { dest: 'src/locales/${locale}/${filename}' } } ]
        },
        translationFiles: [ 
            {
                github: 'src/locales/en-us/file.json',
                smartling: 'files/file.json',
                report: 'Test repo report',
                totalStringCount: 1,
                totalWordCount: 2,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { authorizedStringCount: 1, authorizedWordCount: 2, completedStringCount: 0, completedWordCount: 0 },
                        githubPath: 'src/locales/de-de/file.json', 
                        githubContent: 'file content' 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { authorizedStringCount: 1, authorizedWordCount: 2, completedStringCount: 1, completedWordCount: 2 },
                        githubPath: 'src/locales/nl-nl/file.json', 
                        githubContent: 'file content' 
                    }
                }
            },
            {
                github: 'src/locales/en-us/other-file.json',
                smartling: 'files/other-file.json',
                report: 'Test repo report',
                totalStringCount: 1,
                totalWordCount: 2,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { authorizedStringCount: 1, authorizedWordCount: 2, completedStringCount: 0, completedWordCount: 0 },
                        githubPath: 'src/locales/de-de/other-file.json',
                        githubContent: 'file content'
                    },
                    'nl-NL': {
                        smartlingContent: 'file content',
                        smartlingStatus: { authorizedStringCount: 1, authorizedWordCount: 2, completedStringCount: 1, completedWordCount: 2 },
                        githubPath: 'src/locales/nl-nl/other-file.json',
                        githubContent: 'file content' 
                    }
                }
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL']
    },
    smartlingStatus: {
        fileUri: 'files/file.json',
        totalStringCount: 1,
        totalWordCount: 2,
        items: [
            {
                localeId: 'de-DE',
                authorizedStringCount: 1,
                authorizedWordCount: 2,
                completedStringCount: 0,
                completedWordCount: 0
            },
            {
                localeId: 'nl-NL',
                authorizedStringCount: 1,
                authorizedWordCount: 2,
                completedStringCount: 1,
                completedWordCount: 2
            }
        ]
    },
    translationFiles: [ 
        {
            github: 'src/locales/en-us/file.json',
            smartling: 'files/file.json'
        },
        {
            github: 'src/locales/en-us/other-file.json',
            smartling: 'files/other-file.json'
        }
    ],
    translationFilesGlob: [
        {
            github: 'src/locales/en-us/file.json',
            smartling: 'files/file.json'
        }
    ]
}
