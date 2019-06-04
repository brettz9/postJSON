/* eslint-env node */

// Polyfills
import '../node_modules/core-js-bundle/minified.js';
// import '../node_modules/regenerator-runtime/runtime.js';

// Testing
import {assert as chaiAssert} from 'chai';

// Application
import postJSON from '../dist/index-cjs.js';

global.assert = chaiAssert;
global.postJSON = postJSON;
