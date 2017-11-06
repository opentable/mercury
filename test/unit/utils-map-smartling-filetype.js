'use strict';

const expect = require('chai').expect;
const mapSmartlingFiletype = require('../../src/utils/map-smartling-filetype');

describe('mapSmartlingFiletype.map()', () => {
    it('should correctly map file extensions to the correct Smartling file type', () => {
        expect(mapSmartlingFiletype.map('test content', 'csv')).to.equal('csv');
        expect(mapSmartlingFiletype.map('test content', 'html')).to.equal('html');
        expect(mapSmartlingFiletype.map('test content', 'json')).to.equal('json');
        expect(mapSmartlingFiletype.map('test content', 'properties')).to.equal('javaProperties');
        expect(mapSmartlingFiletype.map('test content', 'resx')).to.equal('resx');
        expect(mapSmartlingFiletype.map('test content', 'resw')).to.equal('resx');
        expect(mapSmartlingFiletype.map('test content', 'txt')).to.equal('plainText');
        expect(mapSmartlingFiletype.map('<resources><string name="test_string">Test XML</string></resources>', 'xml')).to.equal('android');
        expect(mapSmartlingFiletype.map('<!-- smartling.instruction_comments_enabled = on --><resources><string name="test_string">Test XML</string><!-- smartling.instruction_comments_enabled = off --></resources>', 'xml')).to.equal('xml');
        expect(mapSmartlingFiletype.map('<data><string name="home-button">Smartling Hotels</string></data>', 'xml')).to.equal('xml');
        expect(mapSmartlingFiletype.map('test content', 'yaml')).to.equal('yaml');
        expect(mapSmartlingFiletype.map('test content', 'yml')).to.equal('yaml');
    });

    it('should return unknown Smartling file type for invalid extension', () => {
        expect(mapSmartlingFiletype.map('invalid')).to.equal('unknown');
    });
});
