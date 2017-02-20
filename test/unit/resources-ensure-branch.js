'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('resources.ensureBranch()', () => {
    
    const mockedFetchAll = (githubGetMasterStub, githubEnsureBranchStub) => injectr('../../src/resources/ensure-branch.js', {
        '../services/github': {
            getMasterReference: githubGetMasterStub,
            ensureBranchReference: githubEnsureBranchStub
        }
    });
    
    const repository = testData.postGithubFetchRepository;
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const githubGetMasterStub = sinon.stub().yields(null, 'test_master_sha');
            const githubEnsureBranchStub = sinon.stub().yields(null, 'test_branch_sha');
            
            mockedFetchAll(githubGetMasterStub, githubEnsureBranchStub)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append mercuryBranchReference to repository', () => {
            expect(res.mercuryBranchReference).to.eql('test_branch_sha');
        });
    });
    
    describe('when getting master branch fails with an error', () => {
        
        let err, res;
        
        beforeEach((done) => {
            const githubGetMasterStub = sinon.stub().yields({ message: 'Could not get the master branch reference', code: 422 }, null);
            const githubEnsureBranchStub = sinon.stub().yields(null, null);
            
            mockedFetchAll(githubGetMasterStub, githubEnsureBranchStub)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });
    
        it('should show an error', () => {
            expect(err.message).to.contain('Could not get the master branch reference');
        });
    
        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
    
    describe('when ensuring mercury branch fails with an error', () => {
        
        let err, res;
        
        beforeEach((done) => {
            const githubGetMasterStub = sinon.stub().yields(null, 'test_master_sha');
            const githubEnsureBranchStub = sinon.stub().yields({ message: 'Could not create mercury branch reference', code: 422 }, null);
            
            mockedFetchAll(githubGetMasterStub, githubEnsureBranchStub)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });
    
        it('should show an error', () => {
            expect(err.message).to.contain('Could not create mercury branch reference');
        });
    
        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});