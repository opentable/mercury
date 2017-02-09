'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('translations.getStatus()', () => {
    
    const mockedGetStatus = (smartlingStub) => injectr('../../src/translations/get-status.js', {
        '../services/smartling': {
            getStatus: smartlingStub
        }
    }, { console });
    
    const repository = testData.postSmartlingStatusFetchRepository;
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingFetchRepository;
            const smartlingStub = sinon.stub().yields(null, testData.smartlingStatus);
            
            mockedGetStatus(smartlingStub)(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append the smartling status values to the repo', () => {
            expect(res).to.eql(repository);
        });
    });
    
    describe('when smartling get-status fails', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSourceFetchRepository;
            const smartlingStub = sinon.stub().yields(new Error('Error when downloading Smartling status info'));
            
            mockedGetStatus(smartlingStub)(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Error when downloading Smartling status info');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});
