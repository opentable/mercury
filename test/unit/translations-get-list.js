'use strict';

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
            translations: [ { input: { src: 'test/github/path' } } ]
        }
    };
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const githubStub = sinon.stub().yields(null, [ { path: 'test/github/path/file.json' }, { path: 'test/github/path/other-file.json' }]);
            
            mockedGetList(githubStub)(repository, (error, result) => {
                err = error;
                res = result;
                done();
            });
        });
        
        it('should append list of translations to repo key', () => {
            expect(err).to.be.null;
            expect(res.translationFiles).to.be.eql([ 'test/github/path/file.json', 'test/github/path/other-file.json' ]);
        });
        
    });
    
    describe('happy path (using glob in filename)', () => {
    
        let err, res;
        repository.manifestContent.translations[0].input.src = 'test/github/path/*.json';
        
        beforeEach((done) => {
            const githubStub = sinon.stub().yields(null, [ { path: 'test/github/path/file.json' }, { path: 'test/github/path/other-file.yml' }]);
            
            mockedGetList(githubStub)(repository, (error, result) => {
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
    
    describe('when getList returns no results', () => {
        
        let err, res;

		beforeEach(done => {
            const githubStub = sinon.stub().yields(new Error('404 file not found'), []);
            
            mockedGetList(githubStub)(repository, (error, result) => {
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
