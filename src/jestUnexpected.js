const sinon = require('sinon');
const unexpected = require('unexpected');
const baseExpect = unexpected.clone();

// pull in plugin for -sinon assertions
baseExpect.use(require('unexpected-sinon'));

baseExpect.addType({
    name: 'jestMock',
    base: 'function',
    identify: value => typeof value === 'function' && value._isMockFunction
});

baseExpect.addAssertion(
    '<Error|string> to jest match <string>',
    (expect, subject, value) => {
        expect.errorMode = 'bubble';
        let _subject = subject instanceof Error ? subject.message : subject;
        return expect(_subject, 'to contain', value);
    }
);

baseExpect.addAssertion(
    '<Error|string> to jest match <regexp>',
    (expect, subject, value) => {
        expect.errorMode = 'bubble';
        let _subject = subject instanceof Error ? subject.message : subject;
        return expect(_subject, 'to match', value);
    }
);

baseExpect.addAssertion(
    '<any> not to be null or undefined',
    (expect, subject) => {
        expect.errorMode = 'bubble';

        return expect.promise
            .props({
                null: expect(subject, 'not to be null')
                    .catch(e => e)
                    .then(() => null),
                undefined: expect(subject, 'not to be undefined')
                    .catch(e => e)
                    .then(() => null)
            })
            .then(results => {
                var passNull = results.null === null;
                var passUndefined = results.undefined === null;

                if (passNull && passUndefined) {
                    // neither failed so we succeed
                    return;
                }

                if (!passNull && !passUndefined) {
                    throw results.null;
                }

                throw results.undefined;
            });
    }
);

class CustomSpec {
    constructor(spec, value, isTopLevel = true) {
        this.spec = spec;
        this.value = value;
        this.nested = !isTopLevel;
    }
}

function buildCustomSpecWrapper(Type) {
    return value => {
        return new Type(value, undefined, false);
    };
}

function registerUnexpectedTypeForCustomSpec(Type, options = {}) {
    baseExpect.addType({
        name: Type.name,
        base: 'object',
        identify: value => value instanceof Type,
        inspect:
            options.inspect !== undefined
                ? options.inspect
                : ({ spec, nested }, depth, output, inspect) => {
                      if (nested) output.text(`${Type.name}(`);
                      if (spec !== undefined) {
                          output.append(inspect(spec, depth));
                      }
                      if (nested) output.text(')');
                  }
    });
}

function isRegExp(value) {
    return Object.prototype.toString.call(value) === '[object RegExp]';
}

function unpackNestedSpec(expect, { args, spec }) {
    return args !== undefined ? expect.it(...args) : spec;
}

function unpackNestedSpecs(expect, spec) {
    if (spec instanceof CustomSpec) spec = unpackNestedSpec(expect, spec);

    if (Array.isArray(spec)) {
        spec = spec.map(item => {
            if (item instanceof CustomSpec) {
                return unpackNestedSpecs(expect, item);
            } else {
                return item;
            }
        });
    } else if (typeof spec === 'object' && spec !== null && !isRegExp(spec)) {
        spec = Object.assign({}, spec);
        Object.keys(spec).forEach(key => {
            const value = spec[key];
            if (value instanceof CustomSpec) {
                spec[key] = unpackNestedSpecs(expect, value);
            }
        });
    }

    return spec;
}

function anyTypeToString(type) {
    switch (type) {
        case Array:
            return 'array';
        case Function:
            return 'function';
        case Number:
            // XXX workaround expect(1, 'to be a', Number) failing
            return 'number';
        case String:
            return 'string';
        default:
            return null;
    }
}

function inspectWithNativeConstructor(spec, depth, inspect) {
    const anyTypeString = anyTypeToString(spec);
    if (anyTypeString !== null || (typeof spec === 'function' && spec.name)) {
        return spec.name;
    } else {
        return inspect(spec, depth);
    }
}

class AnySpec extends CustomSpec {
    get args() {
        const { spec } = this;
        const anyTypeString = anyTypeToString(spec);
        if (anyTypeString !== null) {
            const a = anyTypeString === 'array' ? 'an' : 'a';
            return [`to be ${a} ${anyTypeString}`];
        } else {
            return ['to be a', spec];
        }
    }
}
registerUnexpectedTypeForCustomSpec(AnySpec, {
    inspect: ({ spec, nested }, depth, output, inspect) => {
        if (nested) output.text(`AnySpec(`);
        output.append(inspectWithNativeConstructor(spec, depth, inspect));
        if (nested) output.text(')');
    }
});

baseExpect.addAssertion(
    '<any> to equal <AnySpec>',
    (expect, subject, anySpec) => {
        expect.errorMode = 'bubble';
        return expect(subject, ...anySpec.args);
    }
);

class AnythingSpec extends CustomSpec {
    get args() {
        return ['not to be null or undefined'];
    }
}
registerUnexpectedTypeForCustomSpec(AnythingSpec);

class ArrayContainingSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(ArrayContainingSpec);

function assertContainingArray(subject, spec) {
    // create a containing assertion and flatten out the elements to check for
    return [subject, 'to contain'].concat(spec);
}

function isPresentIn(element, subject) {
    return subject.indexOf(element) > -1;
}

baseExpect.addAssertion(
    '<array> to equal <ArrayContainingSpec>',
    (expect, subject, { spec }) => {
        spec = unpackNestedSpecs(expect, spec);

        // check if we are operating on a subset
        if (subject.length === spec.length) {
            // prefer "to satisfy" since we are not
            return expect(subject, 'to satisfy', spec);
        }

        try {
            // XXX workaround having no direct containing assertion
            expect.apply(expect, assertContainingArray(subject, spec));
        } catch (e) {
            const present = spec.filter(element =>
                isPresentIn(element, subject)
            );

            expect(present, 'to equal', spec);
        }
    }
);

class CalledWithSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(CalledWithSpec);

baseExpect.addAssertion(
    '<jestMock> to have been called with <CalledWithSpec>',
    (expect, subject, calledWithSpec) => {
        const jestMock = subject.mock;
        const sinonSpy = sinon.spy();

        jestMock.calls.forEach(callArgs => {
            sinonSpy(...callArgs);
        });

        expect.errorMode = 'bubble';
        expect(sinonSpy, 'to have been called with', calledWithSpec);
    }
);

baseExpect.addAssertion(
    '<spy> to have been called with <CalledWithSpec>',
    (expect, subject, { spec }) => {
        const callArgs = spec.map(v => unpackNestedSpecs(expect, v));

        expect(subject, 'to have a call satisfying', callArgs);
    }
);

class ObjectContainingSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(ObjectContainingSpec);

baseExpect.addAssertion(
    '<object> to equal <ObjectContainingSpec>',
    (expect, subject, { spec, nested }) => {
        spec = unpackNestedSpecs(expect, spec);

        if (!nested) expect.errorMode = 'bubble';
        return expect(subject, 'to satisfy', spec);
    }
);

class StringContainingSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(StringContainingSpec);

baseExpect.addAssertion(
    '<string> to equal <StringContainingSpec>',
    (expect, subject, { spec }) => {
        return expect(subject, 'to contain', spec);
    }
);

class IdentitySpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(IdentitySpec);

baseExpect.addAssertion(
    '<array> to contain <IdentitySpec>',
    (expect, subject, { spec }) => {
        expect.errorMode = 'diff';
        return expect(subject, 'to have an item satisfying to be', spec);
    }
);

class KeyPathSpec extends CustomSpec {
    constructor(args) {
        const isValueExplicit = args.length === 2;
        const value = isValueExplicit ? args[1] : undefined;
        super(args[0], value, true);
        this.isValueExplicit = isValueExplicit;
    }
}
registerUnexpectedTypeForCustomSpec(KeyPathSpec);

class PropOrUndefined {
    constructor(value) {
        this.value = value;
    }
}
registerUnexpectedTypeForCustomSpec(PropOrUndefined, {
    inspect: (subject, depth, output, inspect) =>
        output.append(inspect(subject.value))
});

function keyPathToSatisfySpec(
    expect,
    keyPathOrString,
    keyPathValue,
    isValueExplicit
) {
    const keyPath = Array.isArray(keyPathOrString)
        ? keyPathOrString.slice(0)
        : keyPathOrString.split('.');

    let nestedObjects;
    if (keyPath.length > 0) {
        const lastKeyPathPart = keyPath.pop();
        if (isValueExplicit) {
            const value =
                keyPathValue === undefined
                    ? expect.it('to be undefined')
                    : keyPathValue;

            // the innermost property will point to a value
            nestedObjects = { [lastKeyPathPart]: value };
        } else {
            // the innermost property need only to exist in the subject
            nestedObjects = expect
                .it('to be an object')
                .and('to have property', new PropOrUndefined(lastKeyPathPart));
        }
    } else {
        nestedObjects = keyPathValue;
    }

    while (keyPath.length > 0) {
        const property = keyPath.pop();
        // nest previous value within a new object
        nestedObjects = {
            [property]: nestedObjects
        };
    }

    return nestedObjects;
}

baseExpect.addAssertion(
    '<any> [not] to have property <KeyPathSpec>',
    (expect, subject, { spec, value, isValueExplicit }) => {
        expect.errorMode = 'default';
        return expect(
            subject,
            '[not] to satisfy',
            keyPathToSatisfySpec(expect, spec, value, isValueExplicit)
        );
    }
);

baseExpect.addAssertion(
    '<object> to have property <PropOrUndefined>',
    (expect, subject, { value }) => {
        if (
            subject.hasOwnProperty &&
            subject.hasOwnProperty(value) &&
            subject[value] === undefined
        ) {
            return expect(subject[value], 'to be undefined');
        } else {
            return expect(subject, 'to have property', value);
        }
    }
);

class StringMatchingSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(StringMatchingSpec);

baseExpect.addAssertion(
    '<string> to equal <StringMatchingSpec>',
    (expect, subject, { spec }) => {
        return expect(subject, 'to match', spec);
    }
);

function defaultFlags(assertion, flags) {
    return flags.not ? `not ${assertion}` : assertion;
}

module.exports = function expect(subject, ...rest) {
    if (rest.length > 0) {
        throw new Error('Expect takes at most one argument.');
    }

    const expect = baseExpect;
    const flags = {
        not: false
    };
    let _promise = null;

    const _buildAssertion = (assertion, options = {}) => {
        const {
            numberOfArgs = 1,
            withFlags = defaultFlags,
            wrapValue = v => v
        } = options;

        if (numberOfArgs === 0) {
            return () => expect(subject, withFlags(assertion, flags));
        } else if (numberOfArgs > 1) {
            return (...args) =>
                expect(subject, withFlags(assertion, flags), wrapValue(args));
        }

        // single argument case (most common)
        return value =>
            expect(subject, withFlags(assertion, flags), wrapValue(value));
    };

    const buildAssertion = (assertion, options) => {
        const assertionFunction = _buildAssertion(assertion, options);

        return (...args) => {
            if (_promise !== null) {
                return _promise.then(() => assertionFunction(...args));
            } else {
                return assertionFunction(...args);
            }
        };
    };

    const buildAssertionSomeArgs = assertion => {
        const oneArg = buildAssertion(assertion);
        const noArgs = buildAssertion(assertion, { numberOfArgs: 0 });

        return value => (value === undefined ? noArgs() : oneArg(value));
    };

    const assertions = {
        toBe: buildAssertion('to be'),
        toBeCloseTo: buildAssertion('to be close to'),
        toBeDefined: buildAssertion('to be defined', { numberOfArgs: 0 }),
        toBeFalsy: buildAssertion('to be falsy', { numberOfArgs: 0 }),
        toBeGreaterThan: buildAssertion('to be greater than'),
        toBeGreaterThanOrEqual: buildAssertion(
            'to be greater than or equal to'
        ),
        toBeInstanceOf: buildAssertion('to be a'),
        toBeLessThan: buildAssertion('to be less than'),
        toBeLessThanOrEqual: buildAssertion('to be less than or equal to'),
        toBeNull: buildAssertion('to be null', { numberOfArgs: 0 }),
        toBeTruthy: buildAssertion('to be truthy', { numberOfArgs: 0 }),
        toBeUndefined: buildAssertion('to be undefined', {
            numberOfArgs: 0,
            withArgs: assertion => {
                return flags.not ? 'to be defined' : assertion;
            }
        }),
        toContain: buildAssertion('to contain', {
            wrapValue: value => new IdentitySpec(value)
        }),
        toContainEqual: buildAssertion('to contain'),
        toEqual: buildAssertion('to equal'),
        toHaveBeenCalled: buildAssertion('was called', {
            numberOfArgs: 0,
            withFlags: assertion => {
                return flags.not ? 'was not called' : assertion;
            }
        }),
        toHaveBeenCalledTimes: buildAssertion('was called times'),
        toHaveBeenCalledWith: buildAssertion('to have been called with', {
            numberOfArgs: Infinity,
            wrapValue: args => new CalledWithSpec(args)
        }),
        toHaveLength: buildAssertion('to have length'),
        toHaveProperty: buildAssertion('to have property', {
            numberOfArgs: 2,
            wrapValue: args => new KeyPathSpec(args)
        }),
        toMatch: buildAssertion('to jest match'),
        toMatchObject: buildAssertion('to equal', {
            wrapValue: value => new ObjectContainingSpec(value)
        }),
        toMatchSnapshot: () => {
            throw new Error(
                'jest-unexpected: toMatchSnapshot() is not supported.'
            );
        },
        toThrow: buildAssertionSomeArgs('to throw'),
        toThrowErrorMatchingSnapshot: () => {
            throw new Error(
                'jest-unexpected: toThrowErrorMatchingSnapshot() is not supported.'
            );
        }
    };

    const createChainedAssertionPromiseForState = (promiseState, toSubject) => {
        _promise = expect.promise(() => {
            return expect(subject, `to be ${promiseState} with`, result => {
                subject = toSubject(result);
            });
        });
        // attach the assertion methods to allow chaining on the output value
        Object.assign(_promise, assertions);
        // attach the negation operator
        Object.defineProperty(_promise, 'not', {
            get: () => {
                flags.not = true;
                return _promise;
            }
        });
        // return the promise so these calls can be awaited
        return _promise;
    };

    return Object.assign(
        {
            get not() {
                flags.not = true;
                return this;
            },
            get resolves() {
                const resolves = createChainedAssertionPromiseForState(
                    'fulfilled',
                    result => result
                );
                // override "to throw" using "to error" to allow .resolves.toThrow()
                resolves.toThrow = () => expect(() => resolves, 'to error');
                return resolves;
            },
            get rejects() {
                const rejects = createChainedAssertionPromiseForState(
                    'rejected',
                    result => result
                );
                // override "to throw" using "to error" to allow .rejects.toThrow()
                rejects.toThrow = () => expect(() => rejects, 'not to error');
                return rejects;
            }
        },
        assertions
    );
};

module.exports.addSnapshotSerializer = () => {
    throw new Error(
        'jest-unexpected: expect.addSnapshotSerializer() is not supported.'
    );
};
module.exports.any = buildCustomSpecWrapper(AnySpec);
module.exports.anything = buildCustomSpecWrapper(AnythingSpec);
module.exports.arrayContaining = buildCustomSpecWrapper(ArrayContainingSpec);
module.exports.extend = () => {
    throw new Error('jest-unexpected: expect.extend() is not supported.');
};
module.exports.objectContaining = buildCustomSpecWrapper(ObjectContainingSpec);
module.exports.stringContaining = buildCustomSpecWrapper(StringContainingSpec);
module.exports.stringMatching = buildCustomSpecWrapper(StringMatchingSpec);
// attach Unexpected output object to allow controlling e.g. terminal width
module.exports.output = baseExpect.output;
