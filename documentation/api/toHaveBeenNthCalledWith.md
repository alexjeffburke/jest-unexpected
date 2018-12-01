# .toHaveBeenNthCalledWith()

This assertion checks that the nth time a mock was called it was with certain arguments.

```js
const mock = jest.fn();

mock('foo', 'foo');
mock('foo', 'baz');

jestUnexpected(mock).toHaveBeenNthCalledWith(2, 'foo', 'bar');
```

```output
expected
function mockConstructor() {
  return fn.apply(this, arguments);
}
to have been nth called with CalledWithSpec({ spec: [ 'foo', 'bar' ], value: 2, nested: false })
  expected [ 'foo', 'baz' ] to equal [ 'foo', 'bar' ]

  [
    'foo',
    'baz' // should equal 'bar'
          //
          // -baz
          // +bar
  ]
```
