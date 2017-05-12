'use strict';

const _        = require('lodash');
const expect   = require('chai').expect;
const injectr  = require('injectr');
const sinon    = require('sinon');
const testData = require('./testData');

describe('resources.ensureBranch()', () => {
    
    const mockedEnsureBranch = (githubgetBranchReferenceStub, githubEnsureBranchStub) => injectr('../../src/resources/ensure-branch.js', {
        '../services/github': {
            getBranchReference: githubgetBranchReferenceStub,
            ensureBranchReference: githubEnsureBranchStub
        }
    });
    
    const repository = testData.postGithubFetchRepository;
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const githubgetBranchReferenceStub = sinon.stub().yields(null, 'test_master_sha');
            const githubEnsureBranchStub = sinon.stub().yields(null, 'test_branch_sha');
            
            mockedEnsureBranch(githubgetBranchReferenceStub, githubEnsureBranchStub)(_.cloneDeep(repository), (error, result) => {
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

    describe('when workingBranch=develop', () => {

        let err, res, githubgetBranchReferenceStub;
        
        beforeEach((done) => {
            githubgetBranchReferenceStub = sinon.stub().yields(null, 'test_develop_sha');
            const githubEnsureBranchStub = sinon.stub().yields(null, 'test_branch_sha');

            const repo = _.cloneDeep(repository);
            repo.manifestContent.workingBranch = 'develop';
            
            mockedEnsureBranch(githubgetBranchReferenceStub, githubEnsureBranchStub)(repo, (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should get develop branch reference sha', () => {
            expect(githubgetBranchReferenceStub.args[0][0].branch).to.equal('develop');
        });

        it('should append mercuryBranchReference to repository', () => {
            expect(res.mercuryBranchReference).to.eql('test_branch_sha');
        });
    });
    
    describe('when getting master branch fails with an error', () => {
        
        let err, res;
        
        beforeEach((done) => {
            const githubgetBranchReferenceStub = sinon.stub().yields({ message: 'Could not get the master branch reference', code: 422 }, null);
            const githubEnsureBranchStub = sinon.stub().yields(null, null);
            
            mockedEnsureBranch(githubgetBranchReferenceStub, githubEnsureBranchStub)(_.cloneDeep(repository), (error, result) => {
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
            const githubgetBranchReferenceStub = sinon.stub().yields(null, 'test_master_sha');
            const githubEnsureBranchStub = sinon.stub().yields({ message: 'Could not create mercury branch reference', code: 422 }, null);
            
            mockedEnsureBranch(githubgetBranchReferenceStub, githubEnsureBranchStub)(_.cloneDeep(repository), (error, result) => {
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
