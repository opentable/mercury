'use strict';

const async = require('async');
const GithubUtils = require('../../src/services/github/utils');
const expect = require('chai').expect;
const sinon = require('sinon');
const testData = require('./testData');

describe('services.github.file.create()', () => {
  const config = testData.configMock;
  const encodeContent = GithubUtils(config).encodeContent;
  let createFileStub, updateFileStub;

  const firstFailSecondSucceed = () => {
    const githubFile = require('../../src/services/github/file');

    createFileStub = sinon.stub();
    createFileStub.onCall(0).rejects('error');
    createFileStub.onCall(1).resolves({ data: 'success' });

    updateFileStub = sinon.stub();
    updateFileStub.onCall(0).rejects('error');
    updateFileStub.onCall(1).resolves({ data: 'success' });

    return githubFile(
      config,
      {},
      {
        authenticate: () => {},
        repos: {
          createFile: createFileStub,
          createOrUpdateFile: updateFileStub
        }
      }
    );
  };

  describe('on file creation with error and retry', () => {
    let error;

    beforeEach(done => {
      const github = firstFailSecondSucceed();

      const options = { content: 'some-content' };

      const retryPolicy = {
        times: 2,
        interval: 0
      };

      async.retry(retryPolicy, github.create.bind(null, options), err => {
        error = err;
        done();
      });
    });

    it('should not error', () => {
      expect(error).to.be.null;
    });

    it('should make both calls with correct parameters', () => {
      expect(createFileStub.args[0][0].content).to.equal(encodeContent('some-content'));
      expect(createFileStub.args[1][0].content).to.equal(encodeContent('some-content'));
    });
  });

  describe('on file update with error and retry', () => {
    let error;

    beforeEach(done => {
      const github = firstFailSecondSucceed();

      const options = { content: 'some-content' };

      const retryPolicy = {
        times: 2,
        interval: 0
      };

      async.retry(retryPolicy, github.update.bind(null, options), err => {
        error = err;
        done();
      });
    });

    it('should not error', () => {
      expect(error).to.be.null;
    });

    it('should make both calls with correct parameters', () => {
      expect(updateFileStub.args[0][0].content).to.equal(encodeContent('some-content'));
      expect(updateFileStub.args[1][0].content).to.equal(encodeContent('some-content'));
    });
  });
});
