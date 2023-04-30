# .toBeInaceOf()

This assertion checks a subject is a particular type.

```js
const promise = Promise.resolve();

jestUnexpected(promise).toBeInstanceOf(Error);
```

<!-- evaldown output:true -->

```
expected Promise to be a Error
```
