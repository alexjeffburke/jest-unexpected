# .toStrictEqual()

This assertion checks a subject is equal to a value including undefined properties.

```js
jestUnexpected({
    a: undefined,
    b: 2
}).toStrictEqual({ b: 2 });
```

<!-- evaldown output:true -->

```
expected { a: undefined, b: 2 } to strict equal { b: 2 }
  expected { a: undefined, b: 2 } not to contain property 'a'
```

```js
jestUnexpected({
    b: 2
}).toStrictEqual({ a: undefined, b: 2 });
```

<!-- evaldown output:true -->

```
expected { b: 2 } to strict equal { a: undefined, b: 2 }
  expected { b: 2 } to contain property 'a'
```
