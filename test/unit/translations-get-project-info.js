'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');
const testData = require('./testData');

describe('translations.getProjectInfo()', () => {
  const config = testData.configMock;
  const emitter = testData.emitterMock;
  const mockedGetProjectInfo = smartlingStub =>
    injectr('../../src/translations/get-project-info.js', {
      '../services/smartling': { getProjectInfo: smartlingStub }
    })({ emitter, config });

  const repository = testData.preTranslationRepository;

  describe('happy path', () => {
    let err, res;

    beforeEach(done => {
      const repo = _.cloneDeep(repository);
      const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);

      mockedGetProjectInfo(smartlingStub)(_.cloneDeep(repo), (error, result) => {
        err = error;
        res = result;
        done();
      });
    });

    it('should not error', () => {
      expect(err).to.be.null;
    });

    it('should append detected primary language', () => {
      expect(res.sourceLocaleId).to.be.equal('en-US');
    });

    it('should append target languages', () => {
      expect(res.targetLocales).to.be.eql(['de-DE']);
    });
  });

  describe('when smartling fails to fetch project info', () => {
    let err, res;

    beforeEach(done => {
      const smartlingStub = sinon.stub().yields(new Error('I got an error'));
      const repo = _.cloneDeep(repository);

      mockedGetProjectInfo(smartlingStub)(repo, (error, result) => {
        err = error;
        res = result;
        done();
      });
    });

    it('should show an error', () => {
      expect(err.toString()).to.contain('Error: I got an error');
    });

    it('should mark the repo for being skipped', () => {
      expect(res.skip).to.be.true;
    });
  });

  describe('when smartling returns no enabled target languages', () => {
    let res;

    beforeEach(done => {
      const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoNoResultsMock);
      const repo = _.cloneDeep(repository);

      mockedGetProjectInfo(smartlingStub)(repo, (error, result) => {
        res = result;
        done();
      });
    });

    it('should mark the repo for being skipped', () => {
      expect(res.skip).to.be.true;
    });
  });
});
