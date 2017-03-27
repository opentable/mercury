'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('resources.handlePullRequest()', () => {
    
    const mockedHandlePr = (createStub, updateStub) => injectr('../../src/resources/handle-pull-request.js', {
        '../services/github': {
            createPullRequest: createStub,
            updatePullRequest: updateStub
        }
    });

    const repository = testData.postPullRequestFetchInfoRepository;
    
    describe('when pr not found', () => {
    
        let err, createStub, updateStub;

        beforeEach((done) => {

            createStub = sinon.stub().yields(null, 'ok');
            updateStub = sinon.stub().yields(null, 'ok');

            mockedHandlePr(createStub, updateStub)(_.cloneDeep(repository), (error) => {
                err = error;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should create pr', () => {
            expect(createStub.called).to.be.true;
            expect(updateStub.called).to.be.false;
        });
    });

    describe('when pr found but outdated and closed', () => {
    
        let err, createStub, updateStub;

        beforeEach((done) => {

            const repo = _.cloneDeep(repository);
            repo.prInfo = {
                found: true,
                number: 13,
                createdAt: '2017-02-15T15:29:05Z',
                outdated: true,
                closed: true
            }

            createStub = sinon.stub().yields(null, 'ok');
            updateStub = sinon.stub().yields(null, 'ok');

            mockedHandlePr(createStub, updateStub)(repo, (error) => {
                err = error;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should create pr', () => {
            expect(createStub.called).to.be.true;
            expect(updateStub.called).to.be.false;
        });
    });

    describe('when pr found and valid', () => {
    
        let err, createStub, updateStub;

        beforeEach((done) => {

            const repo = _.cloneDeep(repository);
            repo.prInfo = {
                found: true,
                number: 13,
                createdAt: '2017-02-15T15:29:05Z',
                outdated: false
            }

            createStub = sinon.stub().yields(null, 'ok');
            updateStub = sinon.stub().yields(null, 'ok');

            mockedHandlePr(createStub, updateStub)(repo, (error) => {
                err = error;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should update pr', () => {
            expect(createStub.called).to.be.false;
            expect(updateStub.called).to.be.true;
            expect(updateStub.args[0][0].number).to.equal(13);
        });
    });
    
    describe('when pr create fails', () => {
   
        let err, createStub, updateStub;

        beforeEach((done) => {

            const repo = _.cloneDeep(repository);
            repo.prInfo = {
                found: true,
                number: 13,
                createdAt: '2017-02-15T15:29:05Z',
                outdated: true,
                closed: true
            }

            createStub = sinon.stub().yields('an error');
            updateStub = sinon.stub().yields(null, 'ok');

            mockedHandlePr(createStub, updateStub)(repo, (error) => {
                err = error;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Failed while creating pull request');
        });
    });
    
    describe('when pr update fails', () => {
   
        let err, createStub, updateStub;

        beforeEach((done) => {

            const repo = _.cloneDeep(repository);
            repo.prInfo = {
                found: true,
                number: 13,
                createdAt: '2017-02-15T15:29:05Z',
                outdated: false
            }

            createStub = sinon.stub().yields(null, 'ok');
            updateStub = sinon.stub().yields('an error');

            mockedHandlePr(createStub, updateStub)(repo, (error) => {
                err = error;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Failed while updating pull request');
        });
    });
    
    describe('when the skipPullRequest flag is true', () => {
   
        let err, createStub, updateStub;

        beforeEach((done) => {

            const repo = _.cloneDeep(repository);
            repo.skipPullRequest = true;

            createStub = sinon.stub().yields(null, 'ok');
            updateStub = sinon.stub().yields(null, 'ok');

            mockedHandlePr(createStub, updateStub)(repo, (error) => {
                err = error;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should not create or update any pr', () => {
            expect(createStub.called).to.be.false;
            expect(updateStub.called).to.be.false;
        });
    });
});
