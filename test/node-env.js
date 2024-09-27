// Application
import dns from 'dns';

import postJSON from '../src/index-node.js';

// Needed for 127.0.0.1 calls per https://github.com/node-fetch/node-fetch/issues/1624#issuecomment-1407717012
dns.setDefaultResultOrder('ipv4first');

globalThis.postJSON = postJSON;
