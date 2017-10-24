'use strict';

const expect = require('chai').expect;
const mapSmartlingFiletype = require('../../src/utils/map-smartling-filetype');

describe('mapSmartlingFiletype.map()', () => {
    it('should correctly map file extensions to the correct Smartling file type', () => {
        expect(mapSmartlingFiletype.map('csv')).to.equal('csv');
        expect(mapSmartlingFiletype.map('html')).to.equal('html');
        expect(mapSmartlingFiletype.map('json')).to.equal('json');
        expect(mapSmartlingFiletype.map('properties')).to.equal('javaProperties');
        expect(mapSmartlingFiletype.map('resx')).to.equal('resx');
        expect(mapSmartlingFiletype.map('resw')).to.equal('resx');
        expect(mapSmartlingFiletype.map('txt')).to.equal('plainText');    
        expect(mapSmartlingFiletype.map('yaml')).to.equal('yaml');        
        expect(mapSmartlingFiletype.map('yml')).to.equal('yaml');                
    });

    it('should return unknown Smartling file type for invalid extension', () => {
        expect(mapSmartlingFiletype.map('invalid')).to.equal('unknown');         
    });
});

describe('mapSmartlingFiletype.isXml()', () => {
    it('should correctly return true or false if an extension is Xml', () => {
        expect(mapSmartlingFiletype.isXml('xml')).to.be.true;
        expect(mapSmartlingFiletype.isXml('html')).to.be.false;            
    });
});

describe('mapSmartlingFiletype.mapXml()', () => {
    it('should correctly return android or custom xml filetype depending on the contents of the file', () => {
        expect(mapSmartlingFiletype.mapXml('<resources><string name="test_string">Test XML</string></resources>')).to.equal('android');
        expect(mapSmartlingFiletype.mapXml('<data><string name="home-button">Smartling Hotels</string></data>')).to.equal('xml');     
    });
});
