# .toHaveBeenCalledWith()

This assertion checks that a mock was called with certain arguments.

```js
const mock = jest.fn();

mock('foo', 'baz');

jestUnexpected(mock).toHaveBeenCalledWith('foo', 'bar');
```

```output
expected
function mockConstructor() {
  return fn.apply(this, arguments);
}
to have been called with CalledWithSpec({ spec: [ 'foo', 'bar' ], value: undefined, nested: false })

function proxy() {
  return p.invoke(func, this, slice.call(arguments));
}(
  'foo',
  'baz' // should equal 'bar'
        //
        // -baz
        // +bar
);
```
