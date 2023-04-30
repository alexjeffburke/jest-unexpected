# .toHaveBeenCalledTimes()

This assertion checks that a mock was called.

```js
const mock = jest.fn();

mock();

jestUnexpected(mock).toHaveBeenCalledTimes(2);
```

<!-- evaldown output:true -->

```
expected jest.fn() was called times 2
  expected jest.fn()(); to have length 2
    expected 1 to be 2
```
