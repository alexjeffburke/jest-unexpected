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

```output
expected
function mockConstructor() {
  return fn.apply(this, arguments);
}
to have returned
```
