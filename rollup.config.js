const plugins = [
    require('rollup-plugin-commonjs')(),
    require('rollup-plugin-node-resolve')(),
    require('rollup-plugin-node-globals')(),
    require('rollup-plugin-babel')({ runtimeHelpers: true })
];

module.exports = [
    {
        input: 'src/jestUnexpected.js',
        external: ['unexpected', 'unexpected-sinon', 'sinon'],
        output: {
            file: 'lib/jestUnexpected.js',
            format: 'cjs',
            sourcemap: true,
            strict: false
        },
        plugins
    }
];
