'use strict';

const convert = require('xml-js');

const SMARTLING_FILETYPES = {
    csv: 'csv',
    html: 'html',
    json: 'json',
    properties: 'javaProperties',
    resx: 'resx',
    resw: 'resx',
    txt: 'plainText',
    yml: 'yaml',
    yaml: 'yaml'
};

module.exports = {
    isXml: (extension) => {
        return extension === 'xml';
    },
    map: (extension) => {
        const smartlingFileType = SMARTLING_FILETYPES[extension];
        return smartlingFileType ? smartlingFileType : 'unknown';
    },
    mapXml: (content) => {
        const result = convert.xml2js(content, { compact: true });
        return (Object.keys(result)[0]) === 'resources' ? 'android' : 'xml';
    }
};
