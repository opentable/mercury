'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');
const testData = require('./testData');

describe('resources.deleteReferenceIfClosedPr()', () => {
    const mockedDeleteReference = githubStub =>
        injectr('../../src/resources/delete-reference-if-closed-pr.js', {
            '../services/github': {
                deleteReference: githubStub
            }
        });

    describe('when there is no open Mercury pr', () => {
        const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
        let err, githubStub;

        beforeEach(done => {
            githubStub = sinon.stub().yields(null, 'ok');

            mockedDeleteReference(githubStub)(repository, error => {
                err = error;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should call the deleteReference function', () => {
            expect(githubStub.called).to.be.true;
        });
    });

    describe('when pr exists and valid', () => {
        const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
        let err, githubStub;

        beforeEach(done => {
            repository.prInfo = {
                found: true,
                createdAt: '2017-02-14T15:29:05Z',
                number: 123,
                outdated: false
            };

            githubStub = sinon.stub().yields(null, 'ok');

            mockedDeleteReference(githubStub)(repository, error => {
                err = error;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should not call the deleteReference function', () => {
            expect(githubStub.called).to.be.false;
        });
    });

    describe('when pr found and already closed', () => {
        const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
        let err, githubStub;

        beforeEach(done => {
            repository.prInfo = {
                found: true,
                createdAt: '2017-02-14T15:29:05Z',
                number: 123,
                outdated: true,
                closed: true
            };

            githubStub = sinon.stub().yields(null, 'ok');

            mockedDeleteReference(githubStub)(repository, error => {
                err = error;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should call the deleteReference function', () => {
            expect(githubStub.called).to.be.true;
        });
    });

    describe('when the reference has been manually deleted by the repo owner', () => {
        const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
        let err, res;

        beforeEach(done => {
            repository.prInfo = {
                found: false
            };

            const githubStub = sinon.stub().yields(new Error('Reference has already been manually deleted by the repo owners'));

            mockedDeleteReference(githubStub)(repository, (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not return an error', () => {
            expect(err).to.be.null;
        });

        it('should not mark the repo for being skipped', () => {
            expect(res.skip).to.be.undefined;
        });
    });

    describe('when github fails to delete the reference', () => {
        const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
        let err, res;

        beforeEach(done => {
            repository.prInfo = {
                found: false
            };

            const githubStub = sinon.stub().yields(new Error('github error'));

            mockedDeleteReference(githubStub)(repository, (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.toString()).to.contain('Failed while deleting outdated reference');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});
