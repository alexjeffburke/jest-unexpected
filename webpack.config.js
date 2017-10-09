'use strict';

const path = require('path');

module.exports = {
    entry: {
        jestUnexpected: './src/jestUnexpected.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'lib'),

        // output the library wrapped for node
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
            exclude: /.*\.spec\.js/,
            loaders: [
                {
                    loader: 'babel-loader'
                }
            ]
        }
        ]
    },
    externals: {
        sinon: {
            commonjs2: 'sinon'
        },
        unexpected: {
            commonjs2: 'unexpected'
        },
        'unexpected-sinon': {
            commonjs2: 'unexpected-sinon'
        }
    }
};
