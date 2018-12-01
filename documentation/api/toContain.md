# .toContain()

This assertion checks an array or string subject contains a value.

> values are compared using strict equality

## array

```js
jestUnexpected(['a', 'b', 'c', 'd']).toContain('a');
```

```js
jestUnexpected(['a', 'b', 'c', 'd']).toContain('e');
```

```output
expected [ 'a', 'b', 'c', 'd' ] to contain ContainSpec({ spec: 'e', value: undefined, nested: false })
```

If you need structural equality use `.toContainEqual()`:

```js
const something = {};

jestUnexpected(['a', something, 'c', 'd']).toContain(something);
```

```js
const object = { foo: 'bar' };
const other = { foo: 'bar' };

jestUnexpected(['a', object, 'c', 'd']).toContain(other);
```

```output
expected [ 'a', { foo: 'bar' }, 'c', 'd' ] to contain ContainSpec({ spec: { foo: 'bar' }, value: undefined, nested: false })
```

## string

```js
jestUnexpected("foo bar").toContain("baz");
```

```output
expected 'foo bar' to contain ContainSpec({ spec: 'baz', value: undefined, nested: false })

foo bar
    ^^
```
