# postJSON

[![Dependencies](https://img.shields.io/david/brettz9/postJSON.svg)](https://david-dm.org/brettz9/postJSON)
[![devDependencies](https://img.shields.io/david/dev/brettz9/postJSON.svg)](https://david-dm.org/brettz9/postJSON?type=dev)
[![npm](https://img.shields.io/npm/v/simple-post-json.svg)](https://www.npmjs.com/package/simple-post-json)
[![License](https://img.shields.io/npm/l/simple-post-json.svg)](LICENSE-MIT)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/brettz9/postJSON.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/postJSON/context:javascript)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/brettz9/postJSON.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/brettz9/postJSON/alerts)

Simple function module for Node or the browser to send (and retrieve)
JSON via HTTP POST.

# Installation

`npm install simple-post-json`

# API

```js
(async () => {
const json = await postJSON(url, bodyObject, callback, errBack);
})();
```

...or...

```js
(async () => {
const json = await postJSON({
  url, // Only required argument
  body: bodyObject, // JSON object

  headers, // `fetch` headers subobject: https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers
  credentials, // `fetch` credentials: "omit", "same-origin", or "include"

  callback, // No need if using the promise `then` result
  errBack, // No need if catching errors in the promise
  status: statusCallback, // See below
  retrieval: retrievalCallback // See below
});
})();
```

Only the `url` argument is required.

The `headers` object defaults to:

```json
{
  "Accept": "application/json",
  "Content-Type": "application/json"
}
```

The `credentials` string defaults to "same-origin". Other allowable values
are "omit" and "include".

The `status` argument defaults to the following function (available as
`postJSON.status`):

```js
function status (response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
}
```

The `retrieval` argument defaults to the following function (available as
`postJSON.retrieval`), which is what `postJSON` will resolve to:

```js
function retrieval (response) {
  return response.json();
}
```

And if the global `fetch` is not available, `postJSON.fetch` will be checked.
This value is auto-supplied for Node (as ["whatwg-fetch"](https://github.com/github/fetch)),
and if you need `fetch` in the browser, e.g., for Safari, you can include a
script to the polyfill.

# Notes

See also [getJSON](https://github.com/brettz9/getJSON).
