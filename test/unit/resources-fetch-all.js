'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('resources.fetchAll()', () => {
    
    const mockedFetchAll = (githubStub) => injectr('../../src/resources/fetch-all.js', {
        '../services/github': {
            getFileContent: githubStub
        }
    }, { console });
    
    const repository = testData.postGithubFetchRepository;
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingFetchRepository;
            const githubStub = sinon.stub().yields(null, 'file content');
            
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

    describe('when github resource fetch fails', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingFetchRepository;
            const githubStub = sinon.stub().yields(new Error('I got a problem'));
            
            mockedFetchAll(githubStub)(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Error: I got a problem');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});
