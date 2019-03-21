'use strict';

const convert = require('xml-js');

const ANDROID_XML_ROOT_NODE_NAME = 'resources';

const SMARTLING_FILETYPES = {
  csv: 'csv',
  html: 'html',
  json: 'json',
  pot: 'gettext',
  properties: 'javaProperties',
  resx: 'resx',
  resw: 'resx',
  strings: 'ios',
  txt: 'plainText',
  yml: 'yaml',
  yaml: 'yaml'
};

const inferSmartlingFileTypeFromContent = content => {
  const result = convert.xml2js(content, { compact: true });
  const rootNodeName = Object.keys(result)[0];

  return rootNodeName === ANDROID_XML_ROOT_NODE_NAME ? 'android' : 'xml';
};

module.exports = {
  map: (content, extension) => {
    if (extension === 'xml') {
      return inferSmartlingFileTypeFromContent(content);
    } else {
      const smartlingFileType = SMARTLING_FILETYPES[extension];
      return smartlingFileType ? smartlingFileType : 'unknown';
    }
  }
};
