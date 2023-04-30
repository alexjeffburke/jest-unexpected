# .toHaveBeenCalled()

This assertion checks that a mock was executed at least once.

```js
const mock = jest.fn();

jestUnexpected(mock).toHaveBeenCalled();
```

<!-- evaldown output:true -->

```
expected jest.fn() was called
```
