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
                                    smartlingStatus: { completedStringCount: 10, percentCompleted: 100 }
                                },
                                'nl-NL': { 
                                    smartlingStatus: { completedStringCount: 10, percentCompleted: 100 }
                                }
                            }
                        },
                        {
                            github: 'src/locales/en-us/file.json',
                            totalStringCount: 30,
                            locales: {
                                'de-DE': { 
                                    smartlingStatus: { completedStringCount: 30, percentCompleted: 100 }
                                },
                                'nl-NL': {
                                    smartlingStatus: { completedStringCount: 30, percentCompleted: 100 }
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
        
        it('should include a headline for src/locales/en-us/file.json', () => {
            expect(res.body).to.include('Translation status of src/locales/en-us/file.json:');
        });
        
        it('should include a headline for src/locales/en-us/other-file.json', () => {
            expect(res.body).to.include('Translation status of src/locales/en-us/other-file.json:');
        });
        
        it('should include a header for the locale table', () => {
            expect(res.body).to.include('| complete | % |\n|---|---|---|');
        });
        
        it('should include the status of src/locales/en-us/file.json', () => {
            expect(res.body).to.include('| **de-DE** | 1 out of 10 | 10% |');
            expect(res.body).to.include('| **nl-NL** | 10 out of 10 | 100% |');
        });
        
        it('should include the body of src/locales/en-us/other-file.json', () => {
            expect(res.body).to.include('| **de-DE** | 22 out of 30 | 73.3% |');
            expect(res.body).to.include('| **nl-NL** | 0 out of 30 | 0% |');
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
            expect(res.body).to.include('| **de-DE** | N/A | N/A |');
        });
    });
});
