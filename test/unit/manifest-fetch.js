'use strict';

const config = require('config');
const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');
const testData = require('./testData');

describe('manifest.fetch()', () => {
  const emitter = testData.emitterMock;
  const getMockedFetch = (getFileStub, getFileChangedInfoStub) =>
    injectr('../../src/manifest/fetch.js', {
      '../services/github': () => ({
        getFile: getFileStub,
        getFileChangedInfo: getFileChangedInfoStub
      })
    })({ emitter, config });

  let error, result;

  const next = done => (err, res) => {
    error = err;
    result = res;
    done();
  };

  describe('when fetch succeeds', () => {
    describe('when content is valid', () => {
      beforeEach(done => {
        const getFileStub = sinon.stub().yields(null, { content: JSON.stringify({ hello: 'world' }) });
        const getFileChangedInfoStub = sinon.stub().yields(null, '2011-04-14T16:00:49Z');
        const fetch = getMockedFetch(getFileStub, getFileChangedInfoStub);

        fetch(
          {
            owner: 'opentable',
            repo: 'hobknob'
          },
          next(done)
        );
      });

      it('should append parsed content and last updated to repository', () => {
        expect(error).to.be.null;
        expect(result).to.be.eql({
          owner: 'opentable',
          repo: 'hobknob',
          manifestContent: { hello: 'world' },
          manifestUpdated: '2011-04-14T16:00:49Z'
        });
      });
    });

    describe('when content is not valid', () => {
      beforeEach(done => {
        const getFileStub = sinon.stub().yields(null, 'a-string');
        const getFileChangedInfoStub = sinon.stub().yields(null, '2011-04-14T16:00:49Z');
        const fetch = getMockedFetch(getFileStub, getFileChangedInfoStub);

        fetch(
          {
            owner: 'opentable',
            repo: 'hobknob'
          },
          next(done)
        );
      });

      it('should show an error', () => {
        expect(error.toString()).to.contain('An error happened when parsing mercury.json');
      });

      it('should mark the repo for being skipped', () => {
        expect(result.skip).to.be.true;
      });
    });

    describe('when content is valid but info fetch fails', () => {
      beforeEach(done => {
        const getFileStub = sinon.stub().yields(null, { content: JSON.stringify({ hello: 'world' }) });
        const getFileChangedInfoStub = sinon.stub().yields('an error!');
        const fetch = getMockedFetch(getFileStub, getFileChangedInfoStub);

        fetch(
          {
            owner: 'opentable',
            repo: 'hobknob'
          },
          next(done)
        );
      });

      it('should show an error', () => {
        expect(error.toString()).to.contain('An error happened when fetching mercury.json info');
      });

      it('should mark the repo for being skipped', () => {
        expect(result.skip).to.be.true;
      });
    });
  });

  describe('when fetch fails', () => {
    beforeEach(done => {
      const getFileStub = sinon.stub().yields(new Error('404 file not found'));
      const getFileChangedInfoStub = sinon.stub().yields(null, '2011-04-14T16:00:49Z');
      const fetch = getMockedFetch(getFileStub, getFileChangedInfoStub);

      fetch(
        {
          owner: 'opentable',
          repo: 'hobknob'
        },
        next(done)
      );
    });

    it('should show an error', () => {
      expect(error.toString()).to.contain('mercury.json not found. Skipping.');
    });

    it('should mark the repo for being skipped', () => {
      expect(result.skip).to.be.true;
    });
  });
});
