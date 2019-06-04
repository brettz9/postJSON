/* eslint-env node */
import crossFetch from 'cross-fetch';
import postJSON from './index.js';

postJSON.fetch = crossFetch;

export default postJSON;
