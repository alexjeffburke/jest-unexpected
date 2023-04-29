/* global jestUnexpected:true,jestMock:true,jest:true */
/* eslint no-unused-vars: "off" */
jestUnexpected = require('./lib/jestUnexpected');
jestUnexpected.output.preferredWidth = 80;

jestMock = require('jest-mock');

jest = {
    fn: jestMock.fn.bind(jestMock),
};
