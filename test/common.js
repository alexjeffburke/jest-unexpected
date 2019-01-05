/*global expect:true*/
/* eslint no-unused-vars: "off" */
expect =
    typeof exports === 'object'
        ? process.env.CI_TEST_LIB
            ? require('../lib/jestUnexpected')
            : require('../src/jestUnexpected')
        : window.jestUnexpected;
