/* eslint-env node */

// Polyfills
import '../node_modules/core-js-bundle/minified.js';
// import '../node_modules/regenerator-runtime/runtime.js';

// Application
import postJSON from '../src/index-cjs.js';

global.postJSON = postJSON;
