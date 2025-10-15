import crossFetch from 'cross-fetch';
import postJSON from './index.js';

// @ts-expect-error Ok
postJSON.fetch = crossFetch;

export default postJSON;
