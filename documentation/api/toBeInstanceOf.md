# .toBeInaceOf()

This assertion checks a subject is a particular type.

```js
const promise = Promise.resolve();

jestUnexpected(promise).toBeInstanceOf(Error);
```

```output
expected Promise to be a Error
```
