'use strict';

module.exports = {
    githubMock: [ 
        'src/locales/en-us/file.json',
        'src/locales/en-us/other-file.json'
    ],
    githubMockResx: [ 
        'src/locales/folder/Strings.resx',
        'src/locales/otherfolder/Strings.resx'
    ],
    githubMockResxComplex: [ 
        'src/locales/folder/Strings.resx',
        'src/otherlocales/folder/Strings.resx'
    ],
    githubMockComplex: [
        'components/header/header.json',
        'components/footer/footer.json'
    ],
    githubMockDuplicate: [
        'components/duplicate/name.json',
        'components/duplicate/name.json'
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
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [ { input: { src: ['src/locales/en-us/*.json'] }, output: { dest: 'src/locales/${locale}/${filename}' } } ]
        },
        manifestUpdated: '2017-02-15T15:29:05Z'
    },
    preTranslationRepositoryResx: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [ 
                { 
                    input: { 
                        src: ['src/locales/folder/*.resx'] 
                    },
                    output: { dest: 'src/locales/folder/Strings.${locale}.resx' } 
                },
                { 
                    input: { 
                        src: ['src/locales/otherfolder/*.resx'] 
                    },
                    output: { dest: 'src/locales/otherfolder/Strings.${locale}.resx' } 
                }
            ]
        },
        manifestUpdated: '2017-02-15T15:29:05Z'
    },
    preTranslationRepositoryResxComplex: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [ 
                { 
                    input: { 
                        src: ['src/locales/folder/Strings.resx'] 
                    },
                    output: { dest: 'src/locales/folder/Strings.${locale}.resx' } 
                },
                { 
                    input: { 
                        src: ['src/otherlocales/folder/Strings.resx'] 
                    },
                    output: { dest: 'src/otherlocales/folder/Strings.${locale}.resx' } 
                }
            ]
        },
        manifestUpdated: '2017-02-15T15:29:05Z'
    },
    preTranslationRepositoryDuplicate: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [ 
                { 
                    input: { 
                        src: ['components/duplicate/name.json'] 
                    },
                    output: { dest: 'components/duplicate/name.${locale}.json' } 
                },
                { 
                    input: { 
                        src: ['components/duplicate/name.json'] 
                    },
                    output: { dest: 'components/duplicate/name.${locale}.json' } 
                }
            ]
        },
        manifestUpdated: '2017-02-15T15:29:05Z'
    },
    postSourceFetchRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [{
                input: { src: ['src/locales/en-us/*.json'] },
                output: { dest: 'src/locales/${locale}/${filename}' }
            }]
        },
        manifestUpdated: '2017-02-15T15:29:05Z',
        translationFiles: [ 
            {
                src: 'src/locales/en-us/file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report'
            },
            {
                src: 'src/locales/en-us/other-file.json',
                dest: 'src/locales/${locale}/${filename}',
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
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [{
                input: { src: ['src/locales/en-us/*.json'] },
                output: { dest: 'src/locales/${locale}/${filename}' }
            }]
        },
        manifestUpdated: '2017-02-15T15:29:05Z',
        translationFiles: [ 
            {
                src: 'src/locales/en-us/file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
                locales: {
                    'de-DE': { smartlingContent: 'file content' },
                    'nl-NL': { smartlingContent: 'file content' }
                }
            },
            {
                src: 'src/locales/en-us/other-file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
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
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [{
                input: { src: ['src/locales/en-us/*.json'] },
                output: { dest: 'src/locales/${locale}/${filename}' }
            }]
        },
        manifestUpdated: '2017-02-15T15:29:05Z',
        translationFiles: [ 
            {
                src: 'src/locales/en-us/file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
                totalStringCount: 10,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 } 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 } 
                    }
                }
            },
            {
                src: 'src/locales/en-us/other-file.json',
                report: 'Test repo report',
                dest: 'src/locales/${locale}/${filename}',
                totalStringCount: 30,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 22, percentCompleted: 73.3 } 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 0, percentCompleted: 0 } 
                    }
                }
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL']
    },
    postSmartlingStatusFetchRepositoryComplex: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [{
                input: { src: ['src/locales/folder/Strings.resx'] },
                output: { dest: 'src/locales/folder/Strings.${locale.toLowerCase()}.resx' }
            },{
                input: { src: ['src/locales/another-folder/Strings.resx'] },
                output: { dest: 'src/locales/another-folder/Strings.${locale.toLowerCase()}.resx' }
            }]
        },
        manifestUpdated: '2017-02-15T15:29:05Z',
        translationFiles: [
            {
                src: 'src/locales/folder/Strings.resx',
                dest: 'src/locales/folder/Strings.${locale.toLowerCase()}.resx',
                report: 'Test repo report',
                totalStringCount: 1,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 } 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 }  
                    }
                }
            },
            {
                src: 'src/locales/another-folder/Strings.resx',
                dest: 'src/locales/another-folder/Strings.${locale.toLowerCase()}.resx',
                report: 'Test repo report',
                totalStringCount: 1,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 } 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 }  
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
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [{
                input: { src: ['src/locales/en-us/*.json'] },
                output: { dest: 'src/locales/${locale}/${filename}' }
            }]
        },
        manifestUpdated: '2017-02-15T15:29:05Z',
        translationFiles: [ 
            {
                src: 'src/locales/en-us/file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
                totalStringCount: 10,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 },
                        githubPath: 'src/locales/de-DE/file.json', 
                        githubContent: 'file content' 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
                        githubPath: 'src/locales/nl-NL/file.json', 
                        githubContent: 'file content' 
                    }
                }
            },
            {
                src: 'src/locales/en-us/other-file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
                totalStringCount: 30,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 22, percentCompleted: 73.3 },
                        githubPath: 'src/locales/de-DE/other-file.json',
                        githubContent: 'file content'
                    },
                    'nl-NL': {
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 0, percentCompleted: 0 },
                        githubPath: 'src/locales/nl-NL/other-file.json',
                        githubContent: 'file content' 
                    }
                }
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL']
    },
    postGithubFetchRepositoryComplex: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [{
                input: { src: ['src/locales/folder/Strings.resx'] },
                output: { dest: 'src/locales/folder/Strings.${locale.toLowerCase()}.resx' }
            },{
                input: { src: ['src/locales/another-folder/Strings.resx'] },
                output: { dest: 'src/locales/another-folder/Strings.${locale.toLowerCase()}.resx' }
            }]
        },
        manifestUpdated: '2017-02-15T15:29:05Z',
        translationFiles: [ 
            {
                src: 'src/locales/folder/Strings.resx',
                dest: 'src/locales/folder/Strings.${locale.toLowerCase()}.resx',
                report: 'Test repo report',
                totalStringCount: 1,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 },
                        githubPath: 'src/locales/folder/Strings.de-de.resx', 
                        githubContent: 'file content' 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
                        githubPath: 'src/locales/folder/Strings.nl-nl.resx', 
                        githubContent: 'file content' 
                    }
                }
            },
            {
                src: 'src/locales/another-folder/Strings.resx',
                dest: 'src/locales/another-folder/Strings.${locale.toLowerCase()}.resx',
                report: 'Test repo report',
                totalStringCount: 1,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 },
                        githubPath: 'src/locales/another-folder/Strings.de-de.resx', 
                        githubContent: 'file content' 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
                        githubPath: 'src/locales/another-folder/Strings.nl-nl.resx', 
                        githubContent: 'file content' 
                    }
                }
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL']
    },
    postPullRequestFetchInfoRepository: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            workingBranch: 'master',
            smartlingProjectId: '2249fadc3',
            translations: [{
                input: { src: ['src/locales/en-us/*.json'] },
                output: { dest: 'src/locales/${locale}/${filename}' }
            }]
        },
        manifestUpdated: '2017-02-15T15:29:05Z',
        translationFiles: [ 
            {
                src: 'src/locales/en-us/file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
                totalStringCount: 10,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 },
                        githubPath: 'src/locales/de-DE/file.json', 
                        githubContent: 'file content' 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
                        githubPath: 'src/locales/nl-NL/file.json', 
                        githubContent: 'file content' 
                    }
                }
            },
            {
                src: 'src/locales/en-us/other-file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
                totalStringCount: 30,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 22, percentCompleted: 73.3 },
                        githubPath: 'src/locales/de-DE/other-file.json',
                        githubContent: 'file content'
                    },
                    'nl-NL': {
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 0, percentCompleted: 0 },
                        githubPath: 'src/locales/nl-NL/other-file.json',
                        githubContent: 'file content' 
                    }
                }
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL'],
        prInfo: {
            found: false
        }
    },
    postPullRequestFetchInfoRepositoryWithExcludedStrings: {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            workingBranch: 'master',
            smartlingProjectId: 'ABCDEF',
            translations: [{
                input: { src: ['src/locales/en-us/*.json'] },
                output: { dest: 'src/locales/${locale}/${filename}' }
            }]
        },
        manifestUpdated: '2017-02-15T15:29:05Z',
        translationFiles: [ 
            {
                src: 'src/locales/en-us/file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
                totalStringCount: 10,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 },
                        githubPath: 'src/locales/de-de/file.json', 
                        githubContent: 'file content' 
                    },
                    'nl-NL': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 1, completedStringCount: 10, percentCompleted: 100 },
                        githubPath: 'src/locales/nl-nl/file.json', 
                        githubContent: 'file content' 
                    }
                }
            },
            {
                src: 'src/locales/en-us/other-file.json',
                dest: 'src/locales/${locale}/${filename}',
                report: 'Test repo report',
                totalStringCount: 30,
                locales: {
                    'de-DE': { 
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 2, completedStringCount: 22, percentCompleted: 73.3 },
                        githubPath: 'src/locales/de-DE/other-file.json',
                        githubContent: 'file content'
                    },
                    'nl-NL': {
                        smartlingContent: 'file content',
                        smartlingStatus: { excludedStringCount: 0, completedStringCount: 0, percentCompleted: 0 },
                        githubPath: 'src/locales/nl-NL/other-file.json',
                        githubContent: 'file content' 
                    }
                }
            }
        ],
        sourceLocaleId: 'en-US',
        targetLocales: ['de-DE', 'nl-NL'],
        prInfo: {
            found: false
        }
    },
    smartlingStatusFirst: {
        fileUri: 'files/file.json',
        totalStringCount: 10,
        items: [
            {
                localeId: 'de-DE',
                excludedStringCount: 0,
                completedStringCount: 1
            },
            {
                localeId: 'nl-NL',
                excludedStringCount: 0,
                completedStringCount: 10
            }
        ]
    },
    smartlingStatusSecond: {
        fileUri: 'files/other-file.json',
        totalStringCount: 30,
        items: [
            {
                localeId: 'de-DE',
                excludedStringCount: 0,
                completedStringCount: 22
            },
            {
                localeId: 'nl-NL',
                excludedStringCount: 0,
                completedStringCount: 0
            }
        ]
    },
    translationFiles: [ 
        {
            dest: 'src/locales/${locale}/${filename}',
            src: 'src/locales/en-us/file.json'
        },
        {
            dest: 'src/locales/${locale}/${filename}',
            src: 'src/locales/en-us/other-file.json'
        }
    ],
    translationFilesGlob: [
        {
            dest: 'src/locales/${locale}/${filename}',            
            src: 'src/locales/en-us/file.json'
        }
    ],
    translationFilesGlobComplex: [
        {
            dest: 'components/header/locales.${locale}.json',
            src: 'components/header/header.json'
        },
        {
            dest: 'components/footer/locales.${locale}.json',
            src: 'components/footer/footer.json'
        }
    ],
    translationFilesResx: [
        {
            dest: 'src/locales/folder/Strings.${locale}.resx',
            src: 'src/locales/folder/Strings.resx'
        },
        {
            dest: 'src/locales/otherfolder/Strings.${locale}.resx',
            src: 'src/locales/otherfolder/Strings.resx'
        }
    ],
    translationFilesResxComplex: [
        {
            dest: 'src/locales/folder/Strings.${locale}.resx',
            src: 'src/locales/folder/Strings.resx'
        },
        {
            dest: 'src/otherlocales/folder/Strings.${locale}.resx',
            src: 'src/otherlocales/folder/Strings.resx'
        }
    ],
    unsortedLocales: {
        'ja-JP': {
            smartlingContent: 'file content',
            smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
            githubPath: 'src/locales/another-folder/Strings.ja-JP.resx',
            githubContent: 'file content'
        },
        'de-DE': {
            smartlingContent: 'file content',
            smartlingStatus: { excludedStringCount: 0, completedStringCount: 1, percentCompleted: 10 },
            githubPath: 'src/locales/another-folder/Strings.de-de.resx',
            githubContent: 'file content'
        },
        'nl-NL': {
            smartlingContent: 'file content',
            smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
            githubPath: 'src/locales/another-folder/Strings.nl-nl.resx',
            githubContent: 'file content'
        },
        'es-MX': {
            smartlingContent: 'file content',
            smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
            githubPath: 'src/locales/another-folder/Strings.es-MX.resx',
            githubContent: 'file content'
        },
        'en-GB': {
            smartlingContent: 'file content',
            smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
            githubPath: 'src/locales/another-folder/Strings.en-GB.resx',
            githubContent: 'file content'
        },
        'fr-CA': {
            smartlingContent: 'file content',
            smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
            githubPath: 'src/locales/another-folder/Strings.fr-CA.resx',
            githubContent: 'file content'
        },
        'en-US': {
            smartlingContent: 'file content',
            smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 },
            githubPath: 'src/locales/another-folder/Strings.en-US.resx',
            githubContent: 'file content'
        }
    }
}
