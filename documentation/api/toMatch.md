# .toMatch()

This assertion checks whether a strings contains a value or satisfies a regex.

## String

```js
jestUnexpected('foo').toMatch('bar');
```

<!-- evaldown output:true -->

```
expected 'foo' to match 'bar'

foo
```

## Regex

You can also specify the value the property must have.

```js
jestUnexpected('fooobar').toMatch(/f[o]{2}bar/);
```

<!-- evaldown output:true -->

```
expected 'fooobar' to match /f[o]{2}bar/
```
