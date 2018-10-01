global.self = global;
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fetch$1 = _interopDefault(require('cross-fetch'));

/* eslint-env browser */

function status (response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
}
function retrieval (response) {
  return response.json();
}
function postJSON (url, bodyObject, cb, errBack) {
  const dataObject = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  let credentials = 'same-origin', statusCb = status, retrievalCb = retrieval;
  if (url && typeof url === 'object') {
    bodyObject = url.body || bodyObject;
    cb = url.callback || cb;
    errBack = url.errBack || errBack;

    // Properties only available via this object argument API
    statusCb = url.status || status;
    retrievalCb = url.retrieval || retrieval;
    credentials = url.credentials || credentials; // "omit" (default), "same-origin", "include"
    dataObject.headers = Object.assign(dataObject.headers, url.headers);

    url = url.url;
  }
  if (bodyObject) {
    dataObject.body = JSON.stringify(bodyObject);
  }
  dataObject.credentials = credentials;
  let ret = (typeof fetch !== 'undefined' ? fetch : postJSON.fetch)(url, dataObject).then(statusCb).then(retrievalCb);
  if (cb) {
    ret = ret.then(cb);
  }
  if (errBack) {
    ret = ret.catch(errBack);
  }
  return ret;
}
postJSON.retrieval = retrieval;
postJSON.status = status;

/* eslint-env node */

postJSON.fetch = fetch$1;

module.exports = postJSON;
