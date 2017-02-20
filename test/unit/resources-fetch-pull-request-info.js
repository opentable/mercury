'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData  = require('./testData');

describe('resources.fetchPullRequestInfo()', () => {
	
	const mockedFetchAll = (githubStub) => injectr('../../src/resources/fetch-pull-request-info.js', {
		'../services/github': {
			getPullRequestInfo: githubStub
		}
	});
	
	describe('happy path', () => {
	
		const repository = testData.postGithubFetchRepository;
		let err, res;
		
		beforeEach((done) => {
			const githubStub = sinon.stub().yields(null, {
				createdAt: '2017-02-16T15:29:05Z',
				found: true,
				number: 15
			});
			
			mockedFetchAll(githubStub)(_.cloneDeep(repository), (error, result) => {
				err = error;
				res = result;
				done();
			});
		});

		it('should not error', () => {
			expect(err).to.be.null;
		});

		it('should append prInfo to repository', () => {
			expect(res.prInfo).to.eql({
				createdAt: '2017-02-16T15:29:05Z',
				found: true,
				number: 15
			});
		});
	});
	
	describe('when PR does not exist yet', () => {
	
		const repository = testData.postGithubFetchRepository;
		let err, res;
		
		beforeEach((done) => {
			const githubStub = sinon.stub().yields(null, { found: false });
			
			mockedFetchAll(githubStub)(_.cloneDeep(repository), (error, result) => {
				err = error;
				res = result;
				done();
			});
		});

		it('should not error', () => {
			expect(err).to.be.null;
		});

		it('should append prInfo to repository', () => {
			expect(res.prInfo).to.eql({ found: false });
		});
	});
	
	describe('when PR fetch info fails', () => {
	
		let err, res;
		
		beforeEach((done) => {
			const repo = testData.postSmartlingFetchRepository;
			const githubStub = sinon.stub().yields(new Error('github error'));
			
			mockedFetchAll(githubStub)(_.cloneDeep(repo), (error, result) => {
				err = error;
				res = result;
				done();
			});
		});

		it('should show an error', () => {
			expect(err.toString()).to.contain('Failed while fetching pull request info');
		});

		it('should mark the repo for being skipped', () => {
			expect(res.skip).to.be.true;
		});
	});
});
