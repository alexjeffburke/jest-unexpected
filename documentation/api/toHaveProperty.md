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

```output
expected { foo: 1, baz: { baz: null } } to have property KeyPathSpec({ spec: 'foo.bar', value: undefined, nested: false, isValueExplicit: false })

{
  foo: 1, // ⨯ should be an object and
          // ⨯ should have property PropOrUndefined({ value: 'bar' })
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

```output
expected { foo: { bar: 'baz' }, baz: { baz: null } } to have property KeyPathSpec({ spec: 'foo.bar', value: 'bar', nested: false, isValueExplicit: true })

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
