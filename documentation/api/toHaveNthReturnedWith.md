# .toHaveNthReturnedWith()

This assertion checks that the nth successful execution of a mock returned with certain values.

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

jestUnexpected(mock).toHaveNthReturnedWith(1, "foobar");
```

```output
expected
function mockConstructor() {
  return fn.apply(this, arguments);
}
to have nth returned with 1, 'foobar'
  expected 'baz' to equal 'foobar'

  -baz
  +foobar
```
