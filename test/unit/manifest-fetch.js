'use strict';

const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');

describe('manifest.fetch()', () => {

	const getMockedFetch = githubStub => injectr('../../src/manifest/fetch.js', {
		'../services/github': {
			getFileContent: githubStub
		}
	});

	let error, result;

	const next = done => (err, res) => {
		error = err;
		result = res;
		done();
	};

	describe('when fetch succeeds', () => {

		describe('when content is valid', () => {

			beforeEach(done => {
				const fetch = getMockedFetch(sinon.stub().yields(null, { content: JSON.stringify({ hello: 'world' }) }));

				fetch({
					owner: 'opentable',
					repo: 'hobknob'
				}, next(done));
			});

			it('should append parsed content to repo key', () => {
				expect(error).to.be.null;
				expect(result).to.be.eql({
					owner: 'opentable',
					repo: 'hobknob',
					manifestContent: {
						hello: 'world'
					}
				});
			});
		});

		describe('when content is not valid', () => {

			beforeEach(done => {
				const fetch = getMockedFetch(sinon.stub().yields(null, 'a-string'));

				fetch({
					owner: 'opentable',
					repo: 'hobknob'
				}, next(done));
			});

			it('should show an error', () => {
				expect(error.toString()).to.contain('An error happened when parsing manifest.json');
			});

			it('should mark the repo for being skipped', () => {
				expect(result.skip).to.be.true;
			});
		});
	});

	describe('when fetch fails', () => {

		beforeEach(done => {
			const fetch = getMockedFetch(sinon.stub().yields(new Error('404 file not found')));

			fetch({
				owner: 'opentable',
				repo: 'hobknob'
			}, next(done));
		});

		it('should show an error', () => {
			expect(error.toString()).to.contain('manifest.json not found. Skipping.');
		});

		it('should mark the repo for being skipped', () => {
			expect(result.skip).to.be.true;
		});
	});
});
