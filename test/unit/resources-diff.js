'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const testData = require('./testData');

describe('resources.diff()', () => {
    
    const mockedDiff = () => injectr('../../src/resources/diff.js', {}, { console });
        
    describe('happy path with diff returning no changes for any locale file', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const repo = testData.postGithubFetchRepository;
            
            mockedDiff()(_.cloneDeep(repo), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append a false isChanged value to all locale files', () => {
            res.translationFiles.forEach(file => {
                _.forEach(file.locales, locale => {
                    expect(locale.isChanged).to.be.false;    
                });
            });
        });
    });
    
    describe('happy path with diff returning a change in one locale file', () => {
    
        let err, res;
        
        beforeEach((done) => {
            let repo = _.cloneDeep(testData.postGithubFetchRepository);
            _.head(repo.translationFiles).locales['de-DE'].smartlingContent = 'changed file content';
            
            mockedDiff()(repo, (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append a true isChanged value to the changed locale', () => {
            expect(_.head(res.translationFiles).locales['de-DE'].isChanged).to.be.true
        });
    });
});
