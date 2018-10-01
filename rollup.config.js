import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

function getRollupObject ({minifying, format = 'umd'} = {}) {
  const isCJS = format === 'cjs';
  const srcFile = 'index' + (isCJS ? '-cjs' : '');
  const nonMinified = {
    input: `src/${srcFile}.js`,
    output: {
      format,
      sourcemap: minifying,
      file: `dist/index-${format}${minifying ? '.min' : ''}.js`,
      banner: isCJS ? 'global.self = global;' : '',
      name: 'postJSON'
    },
    plugins: [
      isCJS ? commonjs() : babel()
    ]
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
  getRollupObject({minifying: false, format: 'cjs'}),
  {
    input: `test/index.js`,
    output: {
      format: 'cjs',
      file: `test/index-cjs.js`,
      banner: 'global.self = global;'
    },
    plugins: [
      resolve({
        main: true,
        module: false
      }),
      commonjs()
    ],
    external: ['url', 'http', 'https', 'zlib', 'encoding', 'stream']
  },
  {
    input: `test/index.js`,
    output: {
      format: 'umd',
      file: `test/index-umd.js`
    },
    plugins: [
      resolve({
        module: true
      }),
      babel()
    ]
  }
];
