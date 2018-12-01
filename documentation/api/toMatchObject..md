# .toMatchObject()

This assertion checks javascript object satisfies a value.

> values are compared using structural equality

## String

```js
jestUnexpected({
    a: 'foo',
    b: 'baz'
}).toMatchObject({
    a: 'foo',
    b: 'bar'
});
```

```output
expected { a: 'foo', b: 'baz' } to satisfy { a: 'foo', b: 'bar' }

{
  a: 'foo',
  b: 'baz' // should equal 'bar'
           //
           // -baz
           // +bar
}
```
