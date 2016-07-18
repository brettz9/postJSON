# postJSON

Simple function module for Node or the browser to send (and retrieve)
JSON via HTTP POST.

# Installation

`npm install simple-post-json`

...or:

`bower install simple-post-json`

# API

```js
postJSON(url, bodyObject, callback, errBack);
```

...or...

```js
postJSON({
    url: url, // Only required argument
    body: bodyObject,
    callback: callback,
    errBack: errBack,
    headers: headers,
    credentials: credentials,
    status: statusCallback,
    retrieval: retrievalCallback
});
```

Only the `url` argument is required.

The `headers` object defaults to:

```js
{
    'Accept': 'application/json',
    'Content-Type': 'application/json'
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
`postJSON.retrieval`):

```js
function retrieval (response) {
    return response.json();
}
```

And if the global `fetch` is not available, `postJSON.fetch` will be checked.
This value is auto-supplied for Node (as ["whatwg-fetch"](https://github.com/github/fetch)),
and if you need `fetch` in the browser, e.g., for Safari, you can include a
script to the polyfill (including by default with bower installation under
`bower_components/fetch/fetch.js`).

Similarly, if `Object.assign` is not available, `postJSON.objectAssign` will
be checked. This value is auto-supplied for Node (as ["object-assign"](https://github.com/sindresorhus/object-assign)).

# Notes

See also [getJSON](https://github.com/brettz9/getJSON).
