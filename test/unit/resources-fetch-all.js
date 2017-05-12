'use strict';

const _        = require('lodash');
const expect   = require('chai').expect;
const injectr  = require('injectr');
const sinon    = require('sinon');
const testData = require('./testData');

describe('resources.fetchAll()', () => {
    
    const mockedFetchAll = (githubStub) => injectr('../../src/resources/fetch-all.js', {
        '../services/github': {
            getFile: githubStub,
            MAX_CONCURRENT_OPERATIONS: 20
        }
    });
    
    describe('happy path', () => {
    
        const repository = testData.postGithubFetchRepository;
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingStatusFetchRepository;
            const githubStub = sinon.stub().yields(null, { content: 'file content' });
            
            mockedFetchAll(githubStub)(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append all files with content', () => {
            expect(res).to.eql(repository);
        });
    });
    
    describe('complex scenario', () => {
    
        const repository = testData.postGithubFetchRepositoryComplex;
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingStatusFetchRepositoryComplex;
            const githubStub = sinon.stub().yields(null, { content: 'file content' });
            
            mockedFetchAll(githubStub)(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append all files with content', () => {
            expect(res).to.eql(repository);
        });
    });

    describe('when github resource fetch fails with a File not Found', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingFetchRepository;
            const githubStub = sinon.stub().yields({ message: 'Not Found', code: 404 }, { content : null });
            
            mockedFetchAll(githubStub)(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show no errors', () => {
            expect(err).to.be.null;
        });

        it('add a null value to githubContent', () => {
            expect(res.translationFiles[0].locales['de-DE'].githubContent).to.be.null;
        });
    });
    
    describe('when github resource fetch fails with other error', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingFetchRepository;
            const githubStub = sinon.stub().yields({ message: 'BOOM!', code: 500 }, { content: null });
            
            mockedFetchAll(githubStub)(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.message).to.contain('BOOM!');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});
