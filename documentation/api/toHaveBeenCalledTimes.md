# .toHaveBeenCalledTimes()

This assertion checks that a mock was called.

```js
const mock = jest.fn();

mock();

jestUnexpected(mock).toHaveBeenCalledTimes(2);
```

```output
expected
function proxy() {
  return p.invoke(func, this, slice.call(arguments));
}
was called times 2
  expected
  [
    {
      proxy: function proxy() {
        return p.invoke(func, this, slice.call(arguments));
      }, thisValue: undefined, args: [], returnValue: undefined, exception: undefined, callId: 1, errorWithCallStack: undefined
    }
  ]
  to have length 2
    expected 1 to be 2
```
