# .toHaveReturnedTimes()

This assertion checks that a mock successfully returned a given number of times.

```js
const mock = jest.fn();
let wasCalled = false;
mock.mockImplementation(() => {
    if (!wasCalled) {
        wasCalled = true;
        return {};
    } else {
        throw new Error('forced error');
    }
});

mock();
try {
    mock();
} catch (e) {}

jestUnexpected(mock).toHaveReturnedTimes(2);
```

```output
expected
function mockConstructor() {
  return fn.apply(this, arguments);
}
to have returned times 2
  expected 1 to be greater than or equal to 2
```
