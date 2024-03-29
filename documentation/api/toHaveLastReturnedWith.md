# .toHaveLastReturnedWith()

This assertion checks that the last successful execution of a mock returned with certain values.

```js
const mock = jest.fn();
let callCount = 0;
mock.mockImplementation(() => {
    callCount += 1;
    if (callCount === 2) {
        return "foobar";
    }
    return "baz";
});

mock();
mock();
mock();

jestUnexpected(mock).toHaveLastReturnedWith("foobar");
```

<!-- evaldown output:true -->

```
expected jest.fn() to have last returned with 'foobar'

-baz
+foobar
```
