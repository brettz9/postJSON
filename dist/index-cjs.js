global.self = global;
'use strict';

var crossFetch = require('cross-fetch');

/* eslint-disable promise/prefer-await-to-then,
    promise/no-callback-in-promise -- Convenient */

/**
 * @typedef {null|boolean|number|string} JSONPrimitive
 */
/**
 * @typedef {{[member: string]: JSON}} JSONObject
 */
/**
 * @typedef {Array<JSON>} JSONArray
 */
/**
 * @typedef {JSONPrimitive | JSONObject | JSONArray} JSON
 */

/**
 * @callback StatusHandler
 * @param {Response} response
 * @returns {Promise<Response>}
 */
/**
 * @function statusOK
 * @param {Response} response
 * @type {StatusHandler}
 * @returns {Promise<Response>}
 */
function statusOK (response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
}

/**
 * @callback RetrievalHandler
 * @param {Response} response
 * @returns {JSON|Promise<JSON>} The return will be what is returned by
 *  `postJSON` unless it also has a {@link PostJSONCallback} callback.
 */
/**
 * @type {RetrievalHandler}
 */
function retrievalJSON (response) {
  return response.json();
}

/**
 * The keys are header names and the values their values.
 * @typedef {Record<string, string>} Headers
*/

/* eslint-disable jsdoc/reject-any-type -- Genuinely arbitrary */
/**
 * @typedef {any} AnyValue
 */
/* eslint-enable jsdoc/reject-any-type -- Genuinely arbitrary */

/**
* @callback PostJSONErrback
* @param {Error} Any error caught during `fetch`, {@link StatusHandler},
*   {@link RetrievalHandler}, or, if present, {@link PostJSONCallback}.
* @returns {AnyValue} Its return will serve as the return of `postJSON` in the
*   event of it catching an error.
*/

/**
* @callback PostJSONCallback
* @param {AnyValue} result The result of `postJSON`'s {@link RetrievalHandler}
*   (by default {@link retrievalJSON})
* @returns {JSON|Promise<JSON>} Any promise will feed into `errBack` if present.
*   This value will serve as the `postJSON` return result.
*/

/* eslint-disable @stylistic/max-len -- Long */
/**
* @typedef {object} PostJSONOptions
* @property {JSON} [body]
* @property {string} [url]
* @property {PostJSONCallback} [callback]
* @property {PostJSONErrback} [errBack]
* @property {StatusHandler} [status=statusOK]
* @property {RetrievalHandler} [retrieval=retrievalJSON]
* @property {"omit"|"same-origin"|"include"} [credentials="same-origin"]
*   "omit" is `fetch` default
* @property {Headers} [headers={"Accept": "application/json","Content-Type": "application/json"}]
*/
/* eslint-enable @stylistic/max-len -- Long */

/**
 *
 * @param {string|PostJSONOptions} [url]
 * @param {JSON} [bodyObject] Will be overridden by `url.body` if present
 * @param {PostJSONCallback} [cb]
 * @param {PostJSONErrback} [errBack]
 * @returns {Promise<AnyValue>}
 */
function postJSON (url, bodyObject, cb, errBack) {
  /** @type {RequestInit} */
  const dataObject = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  /** @type {RequestCredentials} */
  let credentials = 'same-origin';
  let
    statusCb = statusOK,
    retrievalCb = retrievalJSON;

  if (url && typeof url === 'object') {
    bodyObject = url.body || bodyObject;
    cb = url.callback || cb;
    errBack = url.errBack || errBack;

    // Properties only available via this object argument API
    statusCb = url.status || statusOK;
    retrievalCb = url.retrieval || retrievalJSON;

    credentials = url.credentials || credentials;
    dataObject.headers = Object.assign(
      /** @type {HeadersInit} */ (dataObject.headers), url.headers
    );

    ({url} = url);
  }
  if (bodyObject) {
    dataObject.body = JSON.stringify(bodyObject);
  }
  dataObject.credentials = credentials;
  /* c8 ignore next 3 */
  // @ts-expect-error Ok
  // eslint-disable-next-line unicorn/prefer-global-this -- Ok
  let ret = (typeof window !== 'undefined' ? fetch : postJSON.fetch)(
    url, dataObject
  ).then(statusCb).then(retrievalCb);
  if (cb) {
    ret = ret.then(cb);
  }
  if (errBack) {
    ret = ret.catch(errBack);
  }
  return ret;
}
postJSON.retrieval = retrievalJSON;
postJSON.status = statusOK;

// @ts-expect-error Ok
postJSON.fetch = crossFetch;

module.exports = postJSON;
