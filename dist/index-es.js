function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

/* eslint-env browser */

/* eslint-disable promise/prefer-await-to-then,
    promise/no-callback-in-promise */

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
function statusOK(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }

  return Promise.reject(new Error(response.statusText));
}
/**
 * @callback RetrievalHandler
 * @param {Response} response
 * @returns {any|Promise<any>} The return will be what is returned by
 *  `postJSON` unless it also has a {@link PostJSONCallback} callback.
 */

/**
 * @function retrievalJSON
 * @param {Response} response
 * @type {RetrievalHandler}
 * @returns {JSON}
 */


function retrievalJSON(response) {
  return response.json();
}
/**
 * The keys are header names and the values their values.
 * @typedef {PlainObject<string, string>} Headers
*/

/**
* @callback PostJSONErrback
* @param {Error} Any error caught during `fetch`, {@link StatusHandler},
*   {@link RetrievalHandler}, or, if present, {@link PostJSONCallback}.
* @returns {any} Its return will serve as the return of `postJSON` in the
*   event of it catching an error.
*/

/**
* @callback PostJSONCallback
* @param {any} result The result of `postJSON`'s {@link RetrievalHandler} (by
*   default {@link retrievalJSON})
* @returns {any|Promise<any>} Any promise will feed into `errBack` if present.
*   This value will serve as the `postJSON` return result.
*/

/**
* @typedef {PlainObject} PostJSONOptions
* @property {JSON} [body]
* @property {PostJSONCallback} [callback]
* @property {PostJSONErrback} [errBack]
* @property {StatusHandler} [status=statusOK]
* @property {RetrievalHandler} [retrieval=retrievalJSON]
* @property {"omit"|"same-origin"|"include"} [credentials="same-origin"]
*   "omit" is `fetch` default
* @property {Headers} [headers={"Accept": "application/json",
"Content-Type": "application/json"}]
*/

/**
 *
 * @param {string|PostJSONOptions} [url]
 * @param {JSON} [bodyObject] Will be overridden by `url.body` if present
 * @param {PostJSONCallback} [cb]
 * @param {PostJSONErrback} [errBack]
 * @returns {Promise<any>}
 */


function postJSON(url, bodyObject, cb, errBack) {
  var dataObject = {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  };
  var credentials = 'same-origin',
      statusCb = statusOK,
      retrievalCb = retrievalJSON;

  if (url && _typeof(url) === 'object') {
    bodyObject = url.body || bodyObject;
    cb = url.callback || cb;
    errBack = url.errBack || errBack; // Properties only available via this object argument API

    statusCb = url.status || statusOK;
    retrievalCb = url.retrieval || retrievalJSON;
    credentials = url.credentials || credentials;
    dataObject.headers = Object.assign(dataObject.headers, url.headers);
    var _url = url;
    url = _url.url;
  }

  if (bodyObject) {
    dataObject.body = JSON.stringify(bodyObject);
  }

  dataObject.credentials = credentials;
  var ret = (typeof fetch !== 'undefined' ? fetch : postJSON.fetch)(url, dataObject).then(statusCb).then(retrievalCb);

  if (cb) {
    ret = ret.then(cb);
  }

  if (errBack) {
    ret = ret["catch"](errBack);
  }

  return ret;
}

postJSON.retrieval = retrievalJSON;
postJSON.status = statusOK;

export default postJSON;
