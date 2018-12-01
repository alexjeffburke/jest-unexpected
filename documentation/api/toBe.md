# .toBe()

This assertion checks a subject is a particular value using strict equality.

```js
const promise = Promise.resolve();

jestUnexpected(promise).toBe(promise);
```

```js
const somePromise = Promise.resolve();
const otherPromise = Promise.resolve();

jestUnexpected(somePromise).toBe(otherPromise);
```

```output
expected Promise to be Promise
```
