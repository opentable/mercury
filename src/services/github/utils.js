'use strict';

const base64    = require('base-64');
const utf8      = require('utf8');

module.exports.encodeContent = (content) => {
    const bytes = utf8.encode(content);
    const encoded = base64.encode(bytes);
    return encoded;
};
