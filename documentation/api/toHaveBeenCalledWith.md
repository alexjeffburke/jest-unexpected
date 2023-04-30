# .toHaveBeenCalledWith()

This assertion checks that a mock was called with certain arguments.

```js
const mock = jest.fn();

mock('foo', 'baz');

jestUnexpected(mock).toHaveBeenCalledWith('foo', 'bar');
```

<!-- evaldown output:true -->

```
expected jest.fn() to have been called with [ 'foo', 'bar' ]

jest.fn()(
  'foo',
  'baz' // should equal 'bar'
        //
        // -baz
        // +bar
);
```
