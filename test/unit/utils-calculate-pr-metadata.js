'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const metadataCalculator = require('../../src/utils/calculate-pr-metadata');
const testData = require('./testData');

describe('metadataCalculator.sortLocales()', () => {
    describe('unsorted array to sorted', () => {
        let res;
        const locales = testData.unsortedLocales;

        beforeEach((done) => {
            res = metadataCalculator.sortLocales(_.cloneDeep(locales));
            done();
        });

        it('should be sorted by locale', () => {
            expect(res[0].key).to.equal('de-DE');
            expect(res[0].value).to.deep.equal(locales['de-DE']);
            expect(res[1].key).to.equal('en-GB');
            expect(res[1].value).to.deep.equal(locales['en-GB']);
            expect(res[2].key).to.equal('en-US');
            expect(res[2].value).to.deep.equal(locales['en-US']);
            expect(res[3].key).to.equal('es-MX');
            expect(res[3].value).to.deep.equal(locales['es-MX']);
            expect(res[4].key).to.equal('fr-CA');
            expect(res[4].value).to.deep.equal(locales['fr-CA']);
            expect(res[5].key).to.equal('ja-JP');
            expect(res[5].value).to.deep.equal(locales['ja-JP']);
            expect(res[6].key).to.equal('nl-NL');
            expect(res[6].value).to.deep.equal(locales['nl-NL']);
        });
    });
});

describe('metadataCalculator.sumPercentageCompletedByFile()', () => {
    describe('unsorted array to sorted', () => {
        let res, sortedLocales;
        const locales = testData.unsortedLocales;

        beforeEach((done) => {
            sortedLocales = metadataCalculator.sortLocales(_.cloneDeep(locales));
            res = metadataCalculator.sumPercentageCompletedByFile(sortedLocales);
            done();
        });

        it('should return the percentage completed by file', () => {
            expect(res).to.equal(87.1);
        });
    });
});

describe('metadataCalculator.sumPercentageCompletedOverall()', () => {
    let res;

    beforeEach((done) => {
        const repo = testData.postPullRequestFetchInfoRepository;
        res = metadataCalculator.sumPercentageCompletedOverall(_.cloneDeep(repo));
        done();
    });

    it('should have a percentage complete', () => {
        expect(res).to.equal(183.3);
    });
});

describe('metadataCalculator.countLocales()', () => {
    let res;

    beforeEach((done) => {
        const repo = testData.postPullRequestFetchInfoRepository;
        res = metadataCalculator.countLocales(_.cloneDeep(repo));
        done();
    });

    it('should return the total count of locales in the test data', () => {
        expect(res).to.equal(4);
    });
});

describe('metadataCalculator.countExcludedStrings()', () => {
    let res;

    beforeEach((done) => {
        const repo = testData.postPullRequestFetchInfoRepositoryWithExcludedStrings;
        res = metadataCalculator.countExcludedStrings(_.cloneDeep(repo));
        done();
    });

    it('should return the total excluded strings in the test data', () => {
        expect(res).to.equal(3);
    });
});
