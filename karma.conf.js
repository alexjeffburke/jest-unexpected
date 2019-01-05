var puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function(config) {
    config.set({
        frameworks: ['mocha'],

        files: [
            './node_modules/unexpected/unexpected.js',
            './node_modules/unexpected-sinon/lib/unexpected-sinon.js',
            './node_modules/sinon/pkg/sinon.js',
            './lib/jestUnexpected.umd.js',
            './test/common.js',
            './node_modules/jest-mock/build-es5/index.js',
            './build/jestUnexpected.spec.js'
        ],

        client: {
            mocha: {
                reporter: 'html',
                timeout: 60000
            }
        },

        browsers: ['ChromeHeadless']
    });
};
