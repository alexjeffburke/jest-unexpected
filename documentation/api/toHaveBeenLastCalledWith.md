# .toHaveBeenLastCalledWith()

This assertion checks that the last time a mock was called it was with certain arguments.

```js
const mock = jest.fn();

mock('foo', 'foo');
mock('foo', 'baz');

jestUnexpected(mock).toHaveBeenLastCalledWith('foo', 'bar');
```

```output
expected
function mockConstructor() {
  return fn.apply(this, arguments);
}
to have been last called with CalledWithSpec({ spec: [ 'foo', 'bar' ], value: 2, nested: false })

[
  'foo',
  'baz' // should equal 'bar'
        //
        // -baz
        // +bar
]
```
