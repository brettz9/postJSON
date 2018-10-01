/* eslint-env node */
import postJSON from './index.js';
import fetch from 'cross-fetch';

postJSON.fetch = fetch;

export default postJSON;
