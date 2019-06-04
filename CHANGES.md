# CHANGES for postJSON

## 0.4.0

- Breaking change: Replace deprecated `@babel/polyfill` and add
  `core-js-bundle` dep.
- Breaking change: Require Node 8
- Linting: `ash-nazg/sauron-node`
- Testing: Switch to `mocha`/`chai` and avoid need for build using `esm`
- npm: Update devDeps; `opn-cli` -> `open-cli`; cross-fetch dep.; ignore
  rollup file

## 0.3.1

- Fix: `Object.assign` needed for object signature
- Docs: Reorder arguments semantically
- Testing: Switch test to actually receive a dynamic JSON reply (and based on user-supplied info)

## 0.3.0

- Breaking change: Move source and provide `dist` files (including ESM)
- Breaking change: Remove deprecated Bower
- Breaking change: Remove old Node `Object.assign` polyfill
- Enhancement: ESM source and export with Babel/terser
- Refactoring: Use ES6 features
- Linting (ESLint): Add rc and ignore files
- Linting (LGTM): Add `lgtm.yml`
- License: Reflect license type (MIT) in name
- Docs: Show npm info and LGTM info in README; show return result of resolved promise
- Testing: Add simple test
- Update: Use `cross-fetch`
- npm: Add eslint, rollup, and test scripts; ignore file

## 0.2.0

- Support sending credentials (same-origin by default)

## 0.1.4

- Add separate node-main file to allow shimming which won't cause problems when Bower-installed and loaded with System.js in browser

## 0.1.3

- Fix dependency for node
- Add API documentation to readme

## 0.1.2

- Bugfix re: dependencies

## 0.1.1

- Bugfix for browser

## 0.1.0

- Initial version
