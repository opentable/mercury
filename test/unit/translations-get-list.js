'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');

describe('translations.getList()', () => {
    
    const mockedGetList = githubStub => injectr('../../src/translations/get-list.js', {
        '../services/github': {
            getFilesList: githubStub
        }
    });
    
    const repository = {
        owner: 'opentable',
        repo: 'hobknob',
        manifestContent: {
            translations: [ { input: { src: ['test/github/path/*.json'] } } ]
        }
    };
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const githubStub = sinon.stub().yields(null, ['test/github/path/file.json', 'test/github/path/other-file.json']);
            const repo = _.cloneDeep(repository);
            
            mockedGetList(githubStub)(_.clone(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });
        
        it('should append list of translations to repo key', () => {
            expect(err).to.be.null;
            expect(res.translationFiles).to.be.eql(['test/github/path/file.json', 'test/github/path/other-file.json']);
        });
    });

    describe('when using glob in filename', () => {
        
        describe('happy path', () => {
        
            let err, res;
            
            beforeEach((done) => {
                const githubStub = sinon.stub().yields(null, ['test/github/path/file.json', 'test/github/path/other-file.yml']);
                const repo = _.cloneDeep(repository);
                repo.manifestContent.translations[0].input.src = ['test/github/path/*.json'];

                mockedGetList(githubStub)(repo, (error, result) => {
                    err = error;
                    res = result;
                    done();
                });
            });
            
            it('should append only the translations with the right termination to the repo key', () => {
                expect(err).to.be.null;
                expect(res.translationFiles).to.be.eql([ 'test/github/path/file.json' ]);
            });        
        });

        describe('when using multiple values as src', () => {
        
            let err, res;          
            
            beforeEach((done) => {
                const githubStub = sinon.stub().yields(null, ['test/github/path/file.json', 'test/github/path/config.json']);
                const repo = _.cloneDeep(repository); 
                repo.manifestContent.translations[0].input.src = ['test/github/path/*.json', '!test/github/path/config.json'];
                
                mockedGetList(githubStub)(repo, (error, result) => {
                    err = error;
                    res = result;
                    done();
                });
            });
            
            it('should append only the translations with the right termination to the repo key', () => {
                expect(err).to.be.null;
                expect(res.translationFiles).to.be.eql(['test/github/path/file.json']);
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
			expect(err.toString()).to.contain('Error: No translation files found. Skipping.');
		});

		it('should mark the repo for being skipped', () => {
			expect(res.skip).to.be.true;
		});
	});
});
