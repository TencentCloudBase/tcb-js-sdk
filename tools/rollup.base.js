import pkg from '../package.json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default [
    // browser-friendly UMD build
    {
        input: 'src/main.js',
        output: {
            name: 'index.umd.js',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            babel(),
            resolve(), // so Rollup can find `ms`
            commonjs() // so Rollup can convert `ms` to an ES module
        ]
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/main.js',
        external: [],
        output: [
            { file: pkg.main, format: 'cjs', name: 'index.cjs.js' },
            { file: pkg.module, format: 'es', name: 'index.esm.js' }
        ],
        plugins: [
            babel()
        ]
    }
];
