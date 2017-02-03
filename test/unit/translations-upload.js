'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('translations.upload()', () => {
    
    const mockedUpload = (githubStub, smartlingStub) => injectr('../../src/translations/upload.js', {
        '../services/github': {
            getFileContent: githubStub
        },
        '../services/smartling': {
            uploadFileContent: smartlingStub
        }
    });
    
    const githubStub = sinon.stub().yields(null, testData.githubMock);
    
    const repository = testData.postSourceFetchRepository;
    
    describe('happy path', () => {
        
        describe('when the file is new', () => {
            let err, res;
            
            beforeEach((done) => {
                const smartlingStub = sinon.stub().yields(null, testData.smartlingMockNew);
                
                mockedUpload(githubStub, smartlingStub)(_.cloneDeep(repository), (error, result) => {
                    err = error;
                    res = result;
                    done();
                });
            });
            
            it('should append the correct report to the translationFiles', () => {
                expect(err).to.be.null;
                expect(res.translationFiles[0].report).to.be.eql('New Smartling file uploaded');
            });
        });
        
        describe('when the file is existing', () => {
            let err, res;
            
            beforeEach((done) => {
                const smartlingStub = sinon.stub().yields(null, testData.smartlingMockExisting);
                
                mockedUpload(githubStub, smartlingStub)(_.cloneDeep(repository), (error, result) => {
                    err = error;
                    res = result;
                    done();
                });
            });
            
            it('should append the correct report to the translationFiles', () => {
                expect(err).to.be.null;
                expect(res.translationFiles[0].report).to.be.eql('Existing Smartling file overwritten');
            });
        });
    });
    
    describe('when smartling returns an error', () => {
        let err, res;
        
        beforeEach((done) => {
            const smartlingStub = sinon.stub().yields(new Error('Error when uploading Smartling file'));
            
            mockedUpload(githubStub, smartlingStub)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });
        
        it('should append the error report to the translationFiles', () => {
            expect(err).to.be.null;
            expect(res.translationFiles[0].report).to.be.eql('Error when uploading Smartling file');
        });
    });
});
