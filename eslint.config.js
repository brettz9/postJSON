import ashNazg from 'eslint-config-ash-nazg';

export default [
  {
    ignores: ['dist']
  },
  ...ashNazg(['sauron', 'browser']),
  {
    settings: {
      polyfills: [
        'Object.assign',
        'Promise.reject',
        'Promise.resolve'
      ]
    }
  },
  {
    files: ['*.md/*.js'],
    languageOptions: {
      globals: {
        postJSON: true,
        url: true,
        bodyObject: true,
        callback: true,
        errBack: true,
        headers: true,
        credentials: true,
        statusCallback: true,
        retrievalCallback: true
      }
    },
    rules: {
      'import/unambiguous': 0,
      'jsdoc/require-jsdoc': 0,
      'no-unused-vars': ['error', {
        varsIgnorePattern: 'json|status|retrieval'
      }]
    }
  },
  {
    files: ['test/index.js'],
    languageOptions: {
      globals: {
        assert: 'readonly',
        postJSON: 'readonly'
      }
    },
    rules: {
      'import/unambiguous': 'off'
    }
  },
  {
    rules: {
      indent: ['error', 2, {outerIIFEBody: 0}]
    }
  }
];
