# postJSON

Simple function module for Node or the browser to send (and retrieve) JSON via HTTP POST.

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
postJSON({url: url, body: bodyObject, callback: callback, errBack: errBack, headers: headers, status: statusCallback, retrieval: retrievalCallback);
```

Only the `url` argument is required.

The `headers` object defaults to:

```js
{
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}
```

The `status` argument defaults to the following function (available as `postJSON.status`):

```js
function status (response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    return Promise.reject(new Error(response.statusText));
}
```

The `retrieval` argument defaults to the following function (available as `postJSON.retrieval`):

```js
function retrieval (response) {
    return response.json();
}
```

# Notes

See also [getJSON](https://github.com/brettz9/getJSON).
