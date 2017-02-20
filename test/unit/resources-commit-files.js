'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('resources.commitFiles()', () => {
    
    const mockedCommitFiles = (githubGetFileStub, githubCreateFileStub, githubUpdateFileStub) => injectr('../../src/resources/commit-files.js', {
        '../services/github': {
            getFile: githubGetFileStub,
            createFile: githubCreateFileStub,
            updateFile: githubUpdateFileStub
        }
    });
    
    const repository = testData.postGithubFetchRepository;
    let githubGetFileStub,
        githubCreateFileStub,
        githubUpdateFileStub;
    
    describe('happy path with file creation', () => {
    
        let err;
            
        beforeEach((done) => {
            githubGetFileStub = sinon.stub().yields();
            githubCreateFileStub = sinon.stub().yields();
            githubUpdateFileStub = sinon.stub().yields();
            
            const testRepo = _.cloneDeep(repository);
            testRepo.translationFiles = [
                {
                    locales: {
                        'de-DE': { 
                            smartlingContent: 'file content',
                            githubPath: 'src/locales/de-DE/file.json', 
                            githubContent: null,
                            isDifferent: true
                        }
                    }    
                }
            ];
            
            mockedCommitFiles(githubGetFileStub, githubCreateFileStub, githubUpdateFileStub)(testRepo, (error) => {
                err = error;
                done();
            });
        });
        
        after((done) => {
            githubGetFileStub.reset();
            githubCreateFileStub.reset();
            githubUpdateFileStub.reset();
            done();
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should call createFile once', () => {
            expect(githubCreateFileStub.called).to.be.true;
        });
        
        it('should never call updateFile', () => {
            expect(githubUpdateFileStub.called).to.be.false;
        });
        
        it('should never call getFile', () => {
            expect(githubUpdateFileStub.called).to.be.false;
        });
    });
    
    describe('happy path with file update', () => {
    
        let err;
        
        beforeEach((done) => {
            githubGetFileStub = sinon.stub().yields(null, { sha: 'test_sha' });
            githubCreateFileStub = sinon.stub().yields();
            githubUpdateFileStub = sinon.stub().yields();
            
            const testRepo = _.cloneDeep(repository);
            testRepo.translationFiles = [
                {
                    locales: {
                        'de-DE': { 
                            smartlingContent: 'translated file content',
                            githubPath: 'src/locales/de-DE/file.json', 
                            githubContent: 'file content',
                            isDifferent: true
                        }
                    }    
                }
            ];
            
            mockedCommitFiles(githubGetFileStub, githubCreateFileStub, githubUpdateFileStub)(testRepo, (error) => {
                err = error;
                done();
            });
        });
        
        after((done) => {
            githubGetFileStub.reset();
            githubCreateFileStub.reset();
            githubUpdateFileStub.reset();
            done();
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should never call createFile', () => {
            expect(githubCreateFileStub.called).to.be.false;
        });
        
        it('should call updateFile once', () => {
            expect(githubUpdateFileStub.called).to.be.true;
        });
        
        it('should call getFile once', () => {
            expect(githubUpdateFileStub.called).to.be.true;
        });
    });
    
    describe('happy path with no action', () => {
    
        let err;
        
        beforeEach((done) => {
            githubGetFileStub = sinon.stub().yields();
            githubCreateFileStub = sinon.stub().yields();
            githubUpdateFileStub = sinon.stub().yields();
            
            const testRepo = _.cloneDeep(repository);
            testRepo.translationFiles = [
                {
                    locales: {
                        'de-DE': { 
                            smartlingContent: 'translated file content',
                            githubPath: 'src/locales/de-DE/file.json', 
                            githubContent: 'translated file content',
                            isDifferent: false
                        }
                    }    
                }
            ];
            
            mockedCommitFiles(githubGetFileStub, githubCreateFileStub, githubUpdateFileStub)(testRepo, (error) => {
                err = error;
                done();
            });
        });
        
        after((done) => {
            githubGetFileStub.reset();
            githubCreateFileStub.reset();
            githubUpdateFileStub.reset();
            done();
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should never call createFile', () => {
            expect(githubCreateFileStub.called).to.be.false;
        });
        
        it('should never call updateFile', () => {
            expect(githubUpdateFileStub.called).to.be.false;
        });
        
        it('should never call getFile', () => {
            expect(githubUpdateFileStub.called).to.be.false;
        });
    });
});
