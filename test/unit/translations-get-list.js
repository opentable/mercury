'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');
const testData = require('./testData');

describe('translations.getList()', () => {
  const config = testData.configMock;
  const emitter = testData.emitterMock;
  const mockedGetList = githubStub =>
    injectr('../../src/translations/get-list.js', {
      '../services/github': () => ({ getFilesList: githubStub })
    })({ emitter, config });

  const repository = testData.preTranslationRepository;

  describe('happy path', () => {
    let err, res;

    beforeEach(done => {
      const repo = _.cloneDeep(repository);
      const githubStub = sinon.stub().yields(null, testData.githubMock);

      mockedGetList(githubStub)(_.cloneDeep(repo), (error, result) => {
        err = error;
        res = result;
        done();
      });
    });

    it('should not error', () => {
      expect(err).to.be.null;
    });

    it('should append list of translation files to repo key', () => {
      expect(res.translationFiles).to.be.eql(testData.translationFiles);
    });
  });

  describe('when workingBranch=develop', () => {
    let err, githubStub;

    beforeEach(done => {
      const repo = _.cloneDeep(repository);
      repo.manifestContent.workingBranch = 'develop';
      githubStub = sinon.stub().yields(null, testData.githubMock);

      mockedGetList(githubStub)(repo, error => {
        err = error;
        done();
      });
    });

    it('should not error', () => {
      expect(err).to.be.null;
    });

    it('should use develop branch', () => {
      expect(githubStub.args[0][0].branch).to.be.eql('develop');
    });
  });

  describe('when readOnly=false', () => {
    let err, githubStub, res;

    beforeEach(done => {
      const repo = _.cloneDeep(repository);
      repo.manifestContent.readOnly = true;
      repo.manifestContent.translations = [
        {
          input: { src: ['src/locales/messages.pot'] },
          output: { dest: 'src/locales/${locale}/messages.po' }
        }
      ];

      githubStub = sinon.stub().yields(null, testData.githubMock);

      mockedGetList(githubStub)(repo, (error, result) => {
        err = error;
        res = result;
        done();
      });
    });

    it('should not error', () => {
      expect(err).to.be.null;
    });

    it('should not get files list from github', () => {
      expect(githubStub.called).to.be.false;
    });

    it('should not get files list from github', () => {
      expect(githubStub.called).to.be.false;
    });

    it('should populate repo.translations correctly', () => {
      expect(res.translationFiles).to.be.eql([
        {
          dest: 'src/locales/${locale}/messages.po',
          src: 'src/locales/messages.pot'
        }
      ]);
    });
  });

  describe('when using glob in filename', () => {
    describe('happy path', () => {
      let err, res;

      beforeEach(done => {
        const githubStub = sinon.stub().yields(null, testData.githubMockYml);
        const repo = _.cloneDeep(repository);

        mockedGetList(githubStub)(repo, (error, result) => {
          err = error;
          res = result;
          done();
        });
      });

      it('should append only the translations with the right termination to the repo key', () => {
        expect(err).to.be.null;
        expect(res.translationFiles).to.be.eql(testData.translationFilesGlob);
      });
    });

    describe('when using multiple values as src', () => {
      let err, res;

      beforeEach(done => {
        const githubStub = sinon.stub().yields(null, testData.githubMock);
        const repo = _.cloneDeep(repository);
        repo.manifestContent.translations[0].input.src = ['src/locales/en-us/*.json', '!src/locales/en-us/other-file.json'];

        mockedGetList(githubStub)(repo, (error, result) => {
          err = error;
          res = result;
          done();
        });
      });

      it('should append only the translations with the right termination to the repo key', () => {
        expect(err).to.be.null;
        expect(res.translationFiles).to.be.eql(testData.translationFilesGlob);
      });
    });

    describe('when using multiple values as translations', () => {
      let err, res;

      beforeEach(done => {
        const githubStub = sinon.stub().yields(null, testData.githubMockComplex);
        const repo = _.cloneDeep(repository);
        repo.manifestContent.translations = [
          {
            input: { src: ['components/header/header.json'] },
            output: { dest: 'components/header/locales.${locale}.json' }
          },
          {
            input: { src: ['components/footer/footer.json'] },
            output: { dest: 'components/footer/locales.${locale}.json' }
          }
        ];

        mockedGetList(githubStub)(repo, (error, result) => {
          err = error;
          res = result;
          done();
        });
      });

      it('should map them all', () => {
        expect(err).to.be.null;
        expect(res.translationFiles).to.be.eql(testData.translationFilesGlobComplex);
      });
    });

    describe('when using duplicate file names as translations', () => {
      let err, res;

      beforeEach(done => {
        const githubStub = sinon.stub().yields(null, testData.githubMockResx);
        const repo = _.cloneDeep(testData.preTranslationRepositoryResx);

        mockedGetList(githubStub)(repo, (error, result) => {
          err = error;
          res = result;
          done();
        });
      });

      it('should map them all', () => {
        expect(err).to.be.null;
        expect(res.translationFiles).to.be.eql(testData.translationFilesResx);
      });
    });

    describe('when using duplicate file names but different paths as translations', () => {
      let err, res;

      beforeEach(done => {
        const githubStub = sinon.stub().yields(null, testData.githubMockResxComplex);
        const repo = _.cloneDeep(testData.preTranslationRepositoryResxComplex);

        mockedGetList(githubStub)(repo, (error, result) => {
          err = error;
          res = result;
          done();
        });
      });

      it('should map them all', () => {
        expect(err).to.be.null;
        expect(res.translationFiles).to.be.eql(testData.translationFilesResxComplex);
      });
    });

    describe('when using duplicate file names and duplicate paths as translations', () => {
      let err, res;

      beforeEach(done => {
        const githubStub = sinon.stub().yields(null, testData.githubMockDuplicate);
        const repo = _.cloneDeep(testData.preTranslationRepositoryDuplicate);

        mockedGetList(githubStub)(repo, (error, result) => {
          err = error;
          res = result;
          done();
        });
      });

      it('should show an error', () => {
        expect(err.toString()).to.contain('Error: Duplicate source paths found, check mercury file. Skipping');
      });

      it('should mark the repo for being skipped', () => {
        expect(res.skip).to.be.true;
      });
    });
  });

  describe('when getList returns no results', () => {
    let err, res;

    beforeEach(done => {
      const githubStub = sinon.stub().yields(new Error('404 file not found'), []);
      const repo = _.cloneDeep(repository);

      mockedGetList(githubStub)(repo, (error, result) => {
        err = error;
        res = result;
        done();
      });
    });

    it('should show an error', () => {
      expect(err.toString()).to.contain('Error: No github files found. Skipping.');
    });

    it('should mark the repo for being skipped', () => {
      expect(res.skip).to.be.true;
    });
  });
});
