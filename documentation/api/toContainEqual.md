# .toContainEqual()

This assertion checks an array or string subject contains a value.

> values are compared using structural equality

```js
jestUnexpected(['a', 'b', { foo: 'bar' }, 'd']).toContainEqual({ foo: 'bar' });

jestUnexpected(['a', 'b', { foo: 'bar' }, 'd']).toContainEqual({ foo: 'baz' });
```

<!-- evaldown output:true -->

```
expected [ 'a', 'b', { foo: 'bar' }, 'd' ] to contain equal { foo: 'baz' }
```
