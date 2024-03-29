import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

/**
 * @external RollupConfig
 * @type {PlainObject}
 * @see {@link https://rollupjs.org/guide/en#big-list-of-options}
 */

/**
 * @param {PlainObject} config
 * @param {boolean} config.minifying
 * @param {string} [config.format]
 * @returns {RollupConfig}
 */
function getRollupObject ({minifying, format = 'umd'} = {}) {
  const isCJS = format === 'cjs';
  const srcFile = 'index' + (isCJS ? '-node' : '');
  const nonMinified = {
    input: `src/${srcFile}.js`,
    output: {
      format,
      exports: 'default',
      sourcemap: minifying,
      file: `dist/index-${format}${minifying ? '.min' : ''}.${
        format === 'umd' ? 'c' : ''
      }js`,
      banner: isCJS ? 'global.self = global;' : '',
      name: 'postJSON'
    },
    plugins: isCJS
      ? [resolve(), commonjs()]
      : [babel({
        babelHelpers: 'bundled'
      })]
  };
  if (isCJS) {
    nonMinified.external = ['cross-fetch', 'encoding'];
  }
  if (minifying) {
    nonMinified.plugins.push(terser());
  }
  return nonMinified;
}

// For debugging
// getRollupObject; // eslint-disable-line no-unused-expressions

export default [
  // The first four are for those not using our HTML (though
  //    not currently recommended)
  /**/
  getRollupObject({minifying: false, format: 'umd'}),
  getRollupObject({minifying: true, format: 'umd'}),
  getRollupObject({minifying: true, format: 'es'}),
  getRollupObject({minifying: false, format: 'es'}),
  getRollupObject({minifying: false, format: 'cjs'})
];
