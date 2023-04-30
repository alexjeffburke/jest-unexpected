# expect

This is the top level export of the library.

The function is called with a first argument that is the `"subject"` of
the condition we wish to checl - something that we want to make a distinct
statement about:

```js
const exampleObject = {};

jestUnexpected(exampleObject).toBeDefined();
```

In Unexpected parlance, the `.toBeDefined()` method call on the end is the
assertion itself. In this case, we are stating that `exampleObject` must
be defined in order to meet out expectations.

## Errors & output

When our expectations are invaidated an error will be thrown.

```js
let someThing;

jestUnexpected(someThing).toBeDefined();
```

<!-- evaldown output:true -->

```
expected undefined to be defined
```

## Checking values

Many assertions take an additional argument that we term the `"value"` and
allows us to specify that we our expectation is something specific, such
as a string containg some specific characters or a number being positive:

```js
const ourString = "very string";

jestUnexpected(ourString).toContain("important");
```

<!-- evaldown output:true -->

```
expected 'very string' to contain 'important'

very string
```

```js
const anInteger = 0;

jestUnexpected(anInteger).toBeGreaterThan(0);
```

<!-- evaldown output:true -->

```
expected 0 to be greater than 0
```

# Assertions

We have implemented all assertions present in jest expect incuded in
version 23.6.x of the library.
