/*globals module*/
// Add shims for Node
var postJSON = require('./main');
postJSON.fetch = require('whatwg-fetch');
postJSON.objectAssign = require('object-assign');
module.exports = postJSON;
