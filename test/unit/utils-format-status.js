'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const metadataFormatter = require('../../src/utils/format-pr-metadata');
const testData = require('./testData');

describe('metadataFormatter.format()', () => {
    describe('PR title - happy path', () => {
        let res;
        
        describe('WIP', () => {
            beforeEach((done) => {
                const repo = testData.postPullRequestFetchInfoRepository;
                res = metadataFormatter.format(_.cloneDeep(repo));
                done();
            });
            
            it('should include a title for the Pull Request', () => {
                expect(res.title).to.include('Mercury Pull Request [WIP - 45.8% Overall Completion]');
            });
        });

       describe('READY TO MERGE', () => {
            beforeEach((done) => {
                const repo = {
                    translationFiles: [ 
                        {
                            github: 'src/locales/en-us/file.json',
                            totalStringCount: 10,
                            locales: {
                                'de-DE': { 
                                    smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 }
                                },
                                'nl-NL': { 
                                    smartlingStatus: { excludedStringCount: 0, completedStringCount: 10, percentCompleted: 100 }
                                }
                            }
                        },
                        {
                            github: 'src/locales/en-us/file.json',
                            totalStringCount: 30,
                            locales: {
                                'de-DE': { 
                                    smartlingStatus: { excludedStringCount: 0, completedStringCount: 30, percentCompleted: 100 }
                                },
                                'nl-NL': {
                                    smartlingStatus: { excludedStringCount: 0, completedStringCount: 30, percentCompleted: 100 }
                                }
                            }
                        }
                    ]
                };
                
                res = metadataFormatter.format(_.cloneDeep(repo));
                done();
            });
            
            it('should include a title for the Pull Request', () => {
                expect(res.title).to.include('Mercury Pull Request [READY TO MERGE - 100% Overall Completion]');
            });
        });
    });

    describe('PR status - happy path', () => {
        let res;
                
        beforeEach((done) => {
            const repo = testData.postPullRequestFetchInfoRepository;
            res = metadataFormatter.format(_.cloneDeep(repo));
            done();
        });

        it('should not include an excluded string warning', () => {
            expect(res.body).to.not.include('> :warning: WARNING\n> Your project contains excluded strings.\n> This typically indicates strings that are being managed outside of Smartling workflow.');
        });
        
        it('should include a headline for src/locales/en-us/file.json', () => {
            expect(res.body).to.include('Translation status of src/locales/en-us/file.json:');
        });
        
        it('should include a headline for src/locales/en-us/other-file.json', () => {
            expect(res.body).to.include('Translation status of src/locales/en-us/other-file.json:');
        });
        
        it('should include a header for the locale table', () => {
            expect(res.body).to.include('| | excluded strings | translated strings | total strings | % |\n|---|---|---|---|---|');
        });
        
        it('should include the status of src/locales/en-us/file.json', () => {
            expect(res.body).to.include('| **de-DE** | 0 | 1 | 10 | 10% |');
            expect(res.body).to.include('| **nl-NL** | 0 | 10 | 10 | 100% |');
        });
        
        it('should include the body of src/locales/en-us/other-file.json', () => {
            expect(res.body).to.include('| **de-DE** | 0 | 22 | 30 | 73.3% |');
            expect(res.body).to.include('| **nl-NL** | 0 | 0 | 30 | 0% |');
        });
    });
    
    describe('PR status - excluded strings', () => {
        let res;
                
        beforeEach((done) => {
            const repo = testData.postPullRequestFetchInfoRepositoryWtihExcludedStrings;
            res = metadataFormatter.format(_.cloneDeep(repo));
            done();
        });

        it('should include an excluded string warning', () => {
            expect(res.body).to.include('> :warning: WARNING\n> Your project contains excluded strings.\n> This typically indicates strings that are being managed outside of Smartling workflow.');
        });
        
        it('should include a headline for src/locales/en-us/file.json', () => {
            expect(res.body).to.include('Translation status of src/locales/en-us/file.json:');
        });
        
        it('should include a headline for src/locales/en-us/other-file.json', () => {
            expect(res.body).to.include('Translation status of src/locales/en-us/other-file.json:');
        });
        
        it('should include the status of src/locales/en-us/file.json', () => {
            expect(res.body).to.include('| **de-DE** | 0 | 1 | 10 | 10% |');
            expect(res.body).to.include('| **nl-NL** | 1 ([view in Smartling](https://dashboard.smartling.com/projects/ABCDEF/content/content.htm#excluded/list/filter/locale:nl-NL)) | 10 | 10 | 100% |');
        });
        
        it('should include the body of src/locales/en-us/other-file.json', () => {
            expect(res.body).to.include('| **de-DE** | 2 ([view in Smartling](https://dashboard.smartling.com/projects/ABCDEF/content/content.htm#excluded/list/filter/locale:de-DE)) | 22 | 30 | 73.3% |');
            expect(res.body).to.include('| **nl-NL** | 0 | 0 | 30 | 0% |');
        });
    });
    
    describe('missing smartlingStatus', () => {
        let res;
                
        beforeEach((done) => {
            const repo = testData.postPullRequestFetchInfoRepository;
            repo.translationFiles[0].locales['de-DE'].smartlingStatus = {};
            res = metadataFormatter.format(_.cloneDeep(repo));
            done();
        });
        
        it('should insert N/A everywhere for that locale', () => {
            expect(res.body).to.include('| **de-DE** | 0 | 0 | 10 | N/A |');
        });
    });
});
