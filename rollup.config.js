const pkg = require('./package.json');

const plugins = [
    require('@rollup/plugin-commonjs')(),
    require('@rollup/plugin-node-resolve')(),
];

module.exports = [
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
                sinon: 'sinon',
            },
        },
        plugins,
    },
];
