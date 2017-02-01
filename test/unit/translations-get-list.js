'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('translations.getList()', () => {
    
    const mockedGetList = (githubStub, smartlingStub) => injectr('../../src/translations/get-list.js', {
        '../services/github': {
            getFilesList: githubStub
        },
        '../services/smartling': {
            getProjectInfo: smartlingStub
        }
    });
    
    const repository = testData.preTranslationRepository;
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = _.cloneDeep(repository);
            const githubStub = sinon.stub().yields(null, testData.githubMock);
            const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
            
            mockedGetList(githubStub, smartlingStub)(_.clone(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });
        
        it('should append list of translation files to repo key', () => {
            expect(res.translationFiles).to.be.eql(testData.translationFiles);
        });
        
        it('should append detected primary language', () => {
            expect(res.sourceLocaleId).to.be.equal('en-US');
        });

        it('should append target languages', () => {
            expect(res.targetLocales).to.be.eql(['de-DE']);
        });
    });

    describe('when using glob in filename', () => {
        
        describe('happy path', () => {
        
            let err, res;
            
            beforeEach((done) => {
                const githubStub = sinon.stub().yields(null, testData.githubMockYml);
                const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
                const repo = _.cloneDeep(repository);

                mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
                    err = error;
                    res = result;
                    done();
                });
            });
            
            it('should append only the translations with the right termination to the repo key', () => {
                expect(err).to.be.null;
                expect(res.translationFiles).to.be.eql(testData.translationFilesGlob);
            });        
        });

        describe('when using multiple values as src', () => {
        
            let err, res;          
            
            beforeEach((done) => {
                const githubStub = sinon.stub().yields(null, testData.githubMock);
                const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
                const repo = _.cloneDeep(repository); 
                repo.manifestContent.translations[0].input.src = ['test/github/path/*.json', '!test/github/path/other-file.json'];
                
                mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
                    err = error;
                    res = result;
                    done();
                });
            });
            
            it('should append only the translations with the right termination to the repo key', () => {
                expect(err).to.be.null;
                expect(res.translationFiles).to.be.eql(testData.translationFilesGlob);
            });
        });
    });

    describe('when getList returns no results', () => {
        
        let err, res;

        beforeEach(done => {
            const githubStub = sinon.stub().yields(new Error('404 file not found'), []);
            const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
            const repo = _.cloneDeep(repository);

            mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Error: No translation files found. Skipping.');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });

    describe('when smartling fails to fetch project info', () => {
        
        let err, res;

        beforeEach(done => {
            const githubStub = sinon.stub().yields(null, testData.githubMock);
            const smartlingStub = sinon.stub().yields(new Error('I got an error'));
            const repo = _.cloneDeep(repository);

            mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Error: I got an error');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });

    describe('when smartling returns no enabled target languages', () => {
        
        let res;

        beforeEach(done => {

            const githubStub = sinon.stub().yields(null, testData.githubMock);
            const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoNoResultsMock);
            const repo = _.cloneDeep(repository);

            mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
                res = result;
                done();
            });
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});
