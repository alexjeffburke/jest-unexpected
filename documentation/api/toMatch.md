# .toMatch()

This assertion checks whether a strings contains a value or satisfies a regex.

## String

```js
jestUnexpected('foo').toMatch('bar');
```

```output
expected 'foo' to match MatchSpec({ spec: 'bar', value: undefined, nested: false })

foo
```

## Regex

You can also specify the value the property must have.

```js
jestUnexpected('fooobar').toMatch(/f[o]{2}bar/);
```

```output
expected 'fooobar' to match MatchSpec({ spec: /f[o]{2}bar/, value: undefined, nested: false })
```
