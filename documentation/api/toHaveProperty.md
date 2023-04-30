# .toHaveProperty()

This assertion checks for a the presence of a property.
The value of the proprty can also optionally be chcked.

## Presence

```js
jestUnexpected({
    foo: 1,
    baz: {
        baz: null
    }
}).toHaveProperty('foo.bar');
```

<!-- evaldown output:true -->

```
expected { foo: 1, baz: { baz: null } } to have property 'foo.bar'

{
  foo: 1, // ⨯ should be an object and
          // ⨯ should have property 'bar'
  baz: { baz: null }
}
```

## Value

You can also specify the value the property must have.

```js
jestUnexpected({
    foo: {
        bar: "baz"
    },
    baz: {
        baz: null
    }
}).toHaveProperty('foo.bar', 'bar')
```

<!-- evaldown output:true -->

```
expected { foo: { bar: 'baz' }, baz: { baz: null } } to have property 'foo.bar'

{
  foo: {
    bar: 'baz' // should equal 'bar'
               //
               // -baz
               // +bar
  },
  baz: { baz: null }
}
```
