'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('resources.ensureFork()', () => {
    
    const mockedEnsureFork = (stubs) => injectr('../../src/resources/ensure-fork.js', {
        '../services/github': stubs
    }, { setTimeout });
    
    const repository = testData.postGithubFetchRepository;
    
    describe('happy path', function() {
        
        this.timeout(2500);
        
        let err, res, stubs;
        
        beforeEach((done) => {
            stubs = {
                ensureFork: sinon.stub().yields(null, { full_name: 'testOwner/testRepo', owner: { login: 'testOwner' } }),
                getBranchReference: sinon.stub().yields(null, 'sha1234567890'),
                updateReference: sinon.stub().yields(null, 'ok')
            };
            
            mockedEnsureFork(stubs)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append mercuryForkName and mercuryForkOwner to repository', () => {
            expect(res.mercuryForkName).to.eql('testOwner/testRepo');
            expect(res.mercuryForkOwner).to.eql('testOwner');
        });

        it('should ensure fork/master is up-to-date with upstream/master', () => {
            expect(stubs.updateReference.args[0][0].reference).to.equal('sha1234567890');
        });
    });
    
    describe('when forking fails with an error', () => {
        
        let err, res;
        
        beforeEach((done) => {
            const stubs = {
                ensureFork: sinon.stub().yields({ message: 'Could not create the fork', code: 422 }, { content: null }),
                getBranchReference: sinon.stub().yields(null, 'sha1234567890'),
                updateReference: sinon.stub().yields(null, 'ok')
            };

            mockedEnsureFork(stubs)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.message).to.contain('Could not create the fork');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });

    describe('when getting upstream/master reference fails with an error', () => {
        let err, res, stubs;
        
        beforeEach((done) => {
            stubs = {
                ensureFork: sinon.stub().yields(null, { full_name: 'testOwner/testRepo', owner: { login: 'testOwner' } }),
                getBranchReference: sinon.stub().yields({ code: 404, message: 'Not found'}),
                updateReference: sinon.stub().yields(null, 'ok')
            };
            
            mockedEnsureFork(stubs)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Could not fetch the upstream/master reference');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });

    describe('when rebasing mercuryUser/master from upstream/master fails with an error', function() {
        let err, res, stubs;
        
        this.timeout(2500);
        
        beforeEach((done) => {
            stubs = {
                ensureFork: sinon.stub().yields(null, { full_name: 'testOwner/testRepo', owner: { login: 'testOwner' } }),
                getBranchReference: sinon.stub().yields(null, 'sha1234567890'),
                updateReference: sinon.stub().yields({ code: 400, message: 'Some error'})
            };
            
            mockedEnsureFork(stubs)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Could not rebase fork from upstream/master');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});
