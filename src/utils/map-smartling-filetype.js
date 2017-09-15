'use strict';

const SMARTLING_FILETYPES = {
    csv: 'csv',
    html: 'html',
    json: 'json',
    properties: 'javaProperties',
    resx: 'resx',
    resw: 'resx',
    txt: 'plainText',
    xml: 'xml',
    yml: 'yaml',
    yaml: 'yaml'
}

module.exports = {
    map: (extension) => {
        const smartlingFileType = SMARTLING_FILETYPES[extension];
        return smartlingFileType ? smartlingFileType : 'unknown';
    }
}