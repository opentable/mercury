'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('translations.fetchAll()', () => {
    
    const mockedGetList = (smartlingStub) => injectr('../../src/translations/fetch-all.js', {
        '../services/smartling': {
            fetchFile: smartlingStub
        }
    });
    
    const repository = testData.postFetchRepository;
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = _.cloneDeep(repository);
            const smartlingStub = sinon.stub().yields(null, 'file content');
            
            mockedGetList(smartlingStub)(_.clone(repo), (error, result) => {
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

    describe('when smartling resource fetch fails', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = _.cloneDeep(repository);
            const smartlingStub = sinon.stub().yields(new Error('I got a problem'));
            
            mockedGetList(smartlingStub)(_.clone(repo), (error, result) => {
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
