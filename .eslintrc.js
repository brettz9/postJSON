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
