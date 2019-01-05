# Jest-Unexpected

[![NPM version](https://badge.fury.io/js/jest-unexpected.svg)](http://badge.fury.io/js/jest-unexpected)
[![Build Status](https://travis-ci.org/alexjeffburke/jest-unexpected.svg?branch=master)](https://travis-ci.org/alexjeffburke/jest-unexpected)

This library provides a mapping layer allowing assertions using Jest `expect`
API to execute via Unexpected and leverage it's output capabilities.

Jest-Unexpected aims to be a drop-in such that using it within an existing test
suite is as simple as `npm install jest-unexpected` and adding a require:

```js
const expect = require('jest-unexpected');

describe('a null value', () => {
    it('should equal null', () => {
        expect(null).toEqual(null);
    });
});
```

Read [the documentation](https://alexjeffburke.github.io/jest-unexpected/).

## Browser

Unexpected has full browser support which is inherited by Jest-Unexpected.
The library fuly executes in the browser, and demonstration of this is
available in the `examples` folder or interactively by checking out this
repository and executing:

```
$ npm install
$ npm start
```

## Compatibility

Almost the entirety of Jest `expect` API in implemented with only the following
missing methods which the library will highlight during execution (an exception
will be thrown with a clear message indicating the method name):

* snapshot related functionality
    - toMatchSnapshot()
    - toThrowErrorMatchingSnapshot()
    - expect.addSnapshotSerializer()
* extension related functionality
    - expect.extend()
* secondary assertion aliases

This library supports and is tested against node version **6** and above.

## Output

Unexpected has very powerful output capabilities with features such as inline
diff rendering for complex objects and an emphasis on being able to rapidly
locate issues and provide hints as to corrections.

The examples included here showcase some of these differences via comparisons.

### Array containing string and regex members

![jestExpect match](./images/match.jestExpect.jpg "jestExpect match")

![jestUnexpected match](./images/match.jestUnexpected.jpg "jestUnexpected match")
