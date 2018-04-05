'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');
const testData = require('./testData');

describe('resources.closePullRequestIfOutdated()', () => {
  const mockedClose = githubStub =>
    injectr('../../src/resources/close-pull-request-if-outdated.js', {
      '../services/github': {
        closePullRequest: githubStub
      }
    })(testData.emitterMock);

  describe('when pr does not exist yet', () => {
    const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
    let err, res, githubStub;

    beforeEach(done => {
      githubStub = sinon.stub().yields(null, 'ok');

      mockedClose(githubStub)(repository, (error, result) => {
        err = error;
        res = result;
        done();
      });
    });

    it('should not error', () => {
      expect(err).to.be.null;
    });

    it('should not close any PR', () => {
      expect(githubStub.called).to.be.false;
    });

    it('should leave the repository object untouched', () => {
      expect(res).to.be.eql(repository);
    });
  });

  describe('when pr exists and not outdated', () => {
    const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
    let err, res, githubStub;

    beforeEach(done => {
      repository.prInfo = {
        found: true,
        createdAt: '2017-02-17T15:29:05Z',
        number: 123,
        outdated: false
      };

      githubStub = sinon.stub().yields(null, 'ok');

      mockedClose(githubStub)(repository, (error, result) => {
        err = error;
        res = result;
        done();
      });
    });

    it('should not error', () => {
      expect(err).to.be.null;
    });

    it('should not close any PR', () => {
      expect(githubStub.called).to.be.false;
    });

    it('should leave the repository object untouched', () => {
      expect(res).to.be.eql(repository);
    });
  });

  describe('when pr exists and outdated', () => {
    describe('happy path', () => {
      const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
      let err, res, githubStub;

      beforeEach(done => {
        repository.prInfo = {
          found: true,
          createdAt: '2017-02-14T15:29:05Z',
          number: 123,
          outdated: true
        };

        githubStub = sinon.stub().yields(null, 'ok');

        mockedClose(githubStub)(repository, (error, result) => {
          err = error;
          res = result;
          done();
        });
      });

      it('should not error', () => {
        expect(err).to.be.null;
      });

      it('should close the PR', () => {
        expect(githubStub.called).to.be.true;
        expect(githubStub.args[0][0].number).to.equal(123);
      });

      it('should append to repo that pr has been closed', () => {
        expect(res.prInfo.closed).to.be.true;
      });
    });

    describe('when github fails to remove pr', () => {
      const repository = _.cloneDeep(testData.postPullRequestFetchInfoRepository);
      let err, res;

      beforeEach(done => {
        repository.prInfo = {
          found: true,
          createdAt: '2017-02-14T15:29:05Z',
          number: 123,
          outdated: true
        };

        const githubStub = sinon.stub().yields(new Error('github error'));

        mockedClose(githubStub)(repository, (error, result) => {
          err = error;
          res = result;
          done();
        });
      });

      it('should show an error', () => {
        expect(err.toString()).to.contain('Failed while closing pull request');
      });

      it('should mark the repo for being skipped', () => {
        expect(res.skip).to.be.true;
      });
    });
  });
});
