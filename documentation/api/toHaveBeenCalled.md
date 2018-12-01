# .toHaveBeenCalled()

This assertion checks that a mock was executed at least once.

```js
const mock = jest.fn();

jestUnexpected(mock).toHaveBeenCalled();
```

```output
expected
function proxy() {
  return p.invoke(func, this, slice.call(arguments));
}
was called
```
