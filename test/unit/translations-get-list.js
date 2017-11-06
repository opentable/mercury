'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');
const testData = require('./testData');

describe('translations.getList()', () => {
    const mockedGetList = (githubStub, smartlingStub) =>
        injectr('../../src/translations/get-list.js', {
            '../services/github': {
                getFilesList: githubStub
            },
            '../services/smartling': {
                getProjectInfo: smartlingStub
            }
        });

    const repository = testData.preTranslationRepository;

    describe('happy path', () => {
        let err, res;

        beforeEach(done => {
            const repo = _.cloneDeep(repository);
            const githubStub = sinon.stub().yields(null, testData.githubMock);
            const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);

            mockedGetList(githubStub, smartlingStub)(_.cloneDeep(repo), (error, result) => {
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

        it('should append detected primary language', () => {
            expect(res.sourceLocaleId).to.be.equal('en-US');
        });

        it('should append target languages', () => {
            expect(res.targetLocales).to.be.eql(['de-DE']);
        });
    });

    describe('when workingBranch=develop', () => {
        let err, githubStub;

        beforeEach(done => {
            const repo = _.cloneDeep(repository);
            repo.manifestContent.workingBranch = 'develop';
            githubStub = sinon.stub().yields(null, testData.githubMock);
            const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);

            mockedGetList(githubStub, smartlingStub)(repo, error => {
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

    describe('when using glob in filename', () => {
        describe('happy path', () => {
            let err, res;

            beforeEach(done => {
                const githubStub = sinon.stub().yields(null, testData.githubMockYml);
                const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
                const repo = _.cloneDeep(repository);

                mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
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
                const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
                const repo = _.cloneDeep(repository);
                repo.manifestContent.translations[0].input.src = ['src/locales/en-us/*.json', '!src/locales/en-us/other-file.json'];

                mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
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
                const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
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

                mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
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
                const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
                const repo = _.cloneDeep(testData.preTranslationRepositoryResx);

                mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
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
                const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
                const repo = _.cloneDeep(testData.preTranslationRepositoryResxComplex);

                mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
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
                const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
                const repo = _.cloneDeep(testData.preTranslationRepositoryDuplicate);

                mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
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
            const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoMock);
            const repo = _.cloneDeep(repository);

            mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
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

    describe('when smartling fails to fetch project info', () => {
        let err, res;

        beforeEach(done => {
            const githubStub = sinon.stub().yields(null, testData.githubMock);
            const smartlingStub = sinon.stub().yields(new Error('I got an error'));
            const repo = _.cloneDeep(repository);

            mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
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
            const githubStub = sinon.stub().yields(null, testData.githubMock);
            const smartlingStub = sinon.stub().yields(null, testData.smartlingInfoNoResultsMock);
            const repo = _.cloneDeep(repository);

            mockedGetList(githubStub, smartlingStub)(repo, (error, result) => {
                res = result;
                done();
            });
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});
