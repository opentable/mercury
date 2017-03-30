'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('translations.getStatus()', () => {
    
    const mockedGetStatus = (smartlingStub) => injectr('../../src/translations/get-status.js', {
        '../services/smartling': {
            getStatus: smartlingStub,
            MAX_CONCURRENT_OPERATIONS: 20
        }
    });
    
    const repository = testData.postSmartlingStatusFetchRepository;
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingFetchRepository;
            const smartlingStub = sinon.stub().yields(null, testData.smartlingStatusFirst);
            smartlingStub.onSecondCall().yields(null, testData.smartlingStatusSecond);
            
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
    
    describe('when smartling get-status lacks a locale', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const noLocaleTestData = _.remove(testData.smartlingStatusFirst.items, item => item.localeId === 'de-DE');
            const repo = testData.postSmartlingFetchRepository;
            const smartlingStub = sinon.stub().yields(null, noLocaleTestData);
            
            mockedGetStatus(smartlingStub)(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append an empty smartling status object to that locale', () => {
            expect(res.translationFiles[0].locales['de-DE'].smartlingStatus).to.eql({});
        });
    });
    
    describe('when smartling get-status call returns an error', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postSmartlingFetchRepository;
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
