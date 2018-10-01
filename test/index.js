import {describe, it, assert, mocha} from './lite-mocha.js';

import postJSON from '../';

if (typeof document !== 'undefined') {
  mocha.setup({ui: 'tdd', $context: document.querySelector('#results')}); // $allowHTML: true
}

describe('postJSON', function () {
  // Todo: We need to replace this with a dynamic app and test that what is posted is utilized
  it('Can post JSON', async function () {
    const json = await postJSON('http://localhost:8008/test/sample.json');
    assert(json && typeof json === 'object', 'Returns an object');
  });
});
