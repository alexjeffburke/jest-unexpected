module.exports = [
    {
        input: 'test/jestUnexpected.spec.js',
        external: ['unexpected', 'jest-mock'],
        output: {
            file: 'build/jestUnexpected.spec.js',
            format: 'umd',
            name: 'jestUnexpectedSpec',
            strict: false,
            globals: {
                unexpected: 'weknowhow.expect',
                'jest-mock': 'jest-mock',
            },
        },
        plugins: [
            require('rollup-plugin-commonjs')(),
            require('rollup-plugin-node-resolve')({
                browser: true,
            }),
            require('rollup-plugin-node-globals')(),
            require('rollup-plugin-babel')({
                plugins: ['external-helpers'],
                runtimeHelpers: true,
            }),
        ],
    },
];
