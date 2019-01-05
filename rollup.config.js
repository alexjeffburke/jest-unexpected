const pkg = require('./package.json');

const plugins = [
    require('rollup-plugin-commonjs')(),
    require('rollup-plugin-node-resolve')(),
    require('rollup-plugin-node-globals')()
];

module.exports = [
    {
        input: 'src/jestUnexpected.js',
        external: ['unexpected', 'unexpected-sinon', 'sinon'],
        output: {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            strict: false
        },
        plugins: [
            ...plugins,
            require('rollup-plugin-babel')({ runtimeHelpers: true })
        ]
    },
    {
        input: 'src/jestUnexpected.js',
        external: ['unexpected', 'unexpected-sinon', 'sinon'],
        output: {
            file: pkg.browser,
            name: 'jestUnexpected',
            format: 'umd',
            sourcemap: true,
            strict: false,
            globals: {
                unexpected: 'weknowhow.expect',
                'unexpected-sinon': 'weknowhow.unexpectedSinon',
                sinon: 'sinon'
            }
        },
        plugins: [
            ...plugins,
            require('rollup-plugin-babel')({
                plugins: ['external-helpers'],
                runtimeHelpers: true
            })
        ]
    }
];
