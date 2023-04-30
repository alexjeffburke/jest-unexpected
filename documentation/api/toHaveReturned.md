# .toHaveReturned()

This assertion checks that a mock successfully returned at least once.

```js
const mock = jest.fn();
mock.mockImplementation(() => {
    throw new Error('forced error');
});

try {
    mock();
} catch (e) {}

jestUnexpected(mock).toHaveReturned();
```

<!-- evaldown output:true -->

```
expected jest.fn() to have returned
```
