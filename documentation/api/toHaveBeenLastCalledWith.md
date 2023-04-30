# .toHaveBeenLastCalledWith()

This assertion checks that the last time a mock was called it was with certain arguments.

```js
const mock = jest.fn();

mock('foo', 'foo');
mock('foo', 'baz');

jestUnexpected(mock).toHaveBeenLastCalledWith('foo', 'bar');
```

<!-- evaldown output:true -->

```
expected jest.fn() to have been last called with [ 'foo', 'bar' ]

[
  'foo',
  'baz' // should equal 'bar'
        //
        // -baz
        // +bar
]
```
