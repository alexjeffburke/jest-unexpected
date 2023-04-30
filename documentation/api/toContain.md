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

<!-- evaldown output:true -->

```
expected [ 'a', 'b', 'c', 'd' ] to contain 'e'
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

<!-- evaldown output:true -->

```
expected [ 'a', { foo: 'bar' }, 'c', 'd' ] to contain { foo: 'bar' }
```

## string

```js
jestUnexpected("foo bar").toContain("baz");
```

<!-- evaldown output:true -->

```
expected 'foo bar' to contain 'baz'

foo bar
    ^^
```
