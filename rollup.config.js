import terser from '@rollup/plugin-terser';
import pkg from './package.json' with { type: 'json' };
import docs, {apidocs, typedefs} from '/Volumes/T7/Projects/node/rollup-plugins/rollup-plugin-typedoc/src/main.js';
// eslint-disable-next-line no-undef
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  context: 'this',
  output: {
    file: 'dist/main.js',
    format: 'esm',
    sourcemap: !production,
  },
  plugins:[
    docs([
      apidocs({file: 'README.md'}),
      typedefs()
    ]),
    production && terser({
      format: {
        preamble: `/*! ${pkg.name} v${pkg.version} - ${pkg.author.name} (${pkg.author.url}) - ${pkg.license} license */`
      }
    })
  ]
}

