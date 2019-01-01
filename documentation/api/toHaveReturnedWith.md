# .toHaveReturnedWith()

This assertion checks that a mock successfully returned at least once with certain values.

```js
const mock = jest.fn();
let callCount = 0;
mock.mockImplementation(() => {
    callCount += 1;
    if (callCount === 2) {
        return "foobar";
    }
    return "baz";
});

mock();
mock();
mock();

jestUnexpected(mock).toHaveReturnedWith("bar");
```

```output
expected
function mockConstructor() {
  return fn.apply(this, arguments);
}
to have returned with 'bar'
  expected [ 'baz', 'foobar', 'baz' ] to contain 'bar'
```
