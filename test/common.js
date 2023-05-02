/* global expect:true, TEST_ENV:true */
/* eslint no-unused-vars: "off" */
TEST_ENV =
    typeof exports === 'object'
        ? process.env.CI_TEST_LIB
            ? 'lib'
            : 'src'
        : 'browser';

expect =
    TEST_ENV !== 'browser'
        ? TEST_ENV === 'lib'
            ? require('../lib/jestUnexpected')
            : require('../src/jestUnexpected')
        : window.jestUnexpected;
