# .toHaveBeenNthCalledWith()

This assertion checks that the nth time a mock was called it was with certain arguments.

```js
const mock = jest.fn();

mock('foo', 'foo');
mock('foo', 'baz');

jestUnexpected(mock).toHaveBeenNthCalledWith(2, 'foo', 'bar');
```

<!-- evaldown output:true -->

```
expected jest.fn() to have been nth called with [ 'foo', 'bar' ]
  expected [ 'foo', 'baz' ] to equal [ 'foo', 'bar' ]

  [
    'foo',
    'baz' // should equal 'bar'
          //
          // -baz
          // +bar
  ]
```
