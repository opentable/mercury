'use strict';

const _			= require('lodash');
const expect 	= require('chai').expect;

describe('manifest.validate()', () => {

	const validate = require('../../src/manifest/validate');

	let error, result;

	const next = done => (err, res) => {
		error = err;
		result = res;
		done();
	};

	const repository = {
		manifestContent: {
			smartlingProjectId: 'test-id',
			translations: [{
				input: {
					locale: 'en-us',
					src: './src/locales/en-us/*.json'
				},
				output: {
					src: './src/locales/${locale}/${filename}.json'
				}
			}]
		}
	};

	describe('when validating valid manifest', () => {

		describe('happy path', () => {

			beforeEach(done => validate(repository, next(done)));

			it('should be valid', () => {
				expect(error).to.be.null;
				expect(result).to.be.eql(repository);
			});
		});

		describe('when missing smartlingProjectId', () => {

			const invalid = {
				manifestContent: _.omit(repository.manifestContent, 'smartlingProjectId')
			};

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"smartlingProjectId" is required');
			});
		});

		describe('when missing translations', () => {

			const invalid = {
				manifestContent: _.omit(repository.manifestContent, 'translations')
			};

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"translations" is required');
			});
		});

		describe('when translations empty', () => {

			const invalid = _.cloneDeep(repository);
			invalid.manifestContent.translations = [];

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"translations" does not contain 1 required value(s)');
			});
		});

		describe(`when translation source doesn't contain locale`, () => {

			const invalid = _.cloneDeep(repository);
			delete invalid.manifestContent.translations[0].input.locale;

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"locale" is required');
			});
		});

		describe(`when translation source doesn't contain src path`, () => {

			const invalid = _.cloneDeep(repository);
			delete invalid.manifestContent.translations[0].input.src;

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"src" is required');
			});
		});

		describe(`when translation source contains src path as array`, () => {

			const cloned = _.cloneDeep(repository);
			cloned.manifestContent.translations[0].input.src = [cloned.manifestContent.translations[0].input.src];

			beforeEach(done => validate(cloned, next(done)));

			it('should be valid', () => {
				expect(error).to.be.null;
				expect(result).to.be.eql(cloned);
			});
		});

		describe(`when translation output doesn't contain src path`, () => {

			const invalid = _.cloneDeep(repository);
			delete invalid.manifestContent.translations[0].output.src;

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"src" is required');
			});
		});
	});
});