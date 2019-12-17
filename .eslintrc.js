module.exports = {
  "extends": ["ash-nazg/sauron-node"],
  "parserOptions": {
    "sourceType": "module"
  },
  "plugins": [],
  "env": {
    "node": false,
    "browser": true
  },
  settings: {
    polyfills: [
      "Object.assign",
      "Promise.reject",
      "Promise.resolve"
    ]
  },
  "overrides": [
    {
      files: '*.html',
      rules: {
        'import/unambiguous': 0
      }
    },
    {
      files: '*.md',
      globals: {
        postJSON: true,
        url: true,
        bodyObject: true,
        callback: true,
        errBack: true,
        headers: true,
        credentials: true,
        statusCallback: true,
        retrievalCallback: true,
      },
      rules: {
        'import/unambiguous': 0,
        'jsdoc/require-jsdoc': 0,
        'no-unused-vars': ['error', {varsIgnorePattern: 'json|status|retrieval'}]
      }
    },
    {
      "files": ["test/index.js"],
      globals: {
        assert: "readonly",
        postJSON: "readonly"
      },
      env: {
        mocha: true
      },
      rules: {
        'import/unambiguous': 'off'
      }
    }
  ],
  "rules": {
    "indent": ["error", 2, {"outerIIFEBody": 0}]
  }
};
