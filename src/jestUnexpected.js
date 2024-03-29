const unexpected = require('unexpected');
const jestMockToSinonSpy = require('./jestMockToSinonSpy');

const baseExpect = unexpected.clone();

const baseExpectFlags = {
    not: false,
};

// pull in plugin for -sinon assertions
baseExpect.use(require('unexpected-sinon'));

baseExpect.addType({
    name: 'jestMock',
    base: 'wrapperObject',
    unwrap: (value) => jestMockToSinonSpy(value),
    prefix: (output) => output,
    suffix: (output) => output,
    identify: (value) => typeof value === 'function' && value._isMockFunction,
});

baseExpect.addAssertion(
    '<any> not to be null or undefined',
    (expect, subject) => {
        expect.errorMode = 'bubble';

        return expect.promise
            .props({
                null: expect(subject, 'not to be null')
                    .catch((e) => e)
                    .then(() => null),
                undefined: expect(subject, 'not to be undefined')
                    .catch((e) => e)
                    .then(() => null),
            })
            .then((results) => {
                const passNull = results.null === null;
                const passUndefined = results.undefined === null;

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

baseExpect.addAssertion(
    '<any> to strict equal <any>',
    (expect, subject, value) => {
        if (
            !(
                typeof subject === 'object' &&
                subject &&
                typeof value === 'object' &&
                value
            )
        ) {
            expect.fail({ message: '' });
        }

        const lhsKeyMap = {};
        const rhsOnlyKeys = [];
        Object.keys(subject).forEach((key) => (lhsKeyMap[key] = true));
        Object.keys(value).forEach((key) => {
            if (key in lhsKeyMap) {
                delete lhsKeyMap[key];
            } else {
                rhsOnlyKeys.push(key);
            }
        });

        Object.keys(lhsKeyMap).forEach((subjectKey) => {
            if (
                subject[subjectKey] === undefined &&
                Object.prototype.hasOwnProperty.call(subject, subjectKey)
            ) {
                expect.errorMode = 'nested';
                expect.fail(
                    'expected {0} not to contain property {1}',
                    subject,
                    subjectKey
                );
            }
        });

        rhsOnlyKeys.forEach((valueKey) => {
            if (
                value[valueKey] === undefined &&
                Object.prototype.hasOwnProperty.call(value, valueKey)
            ) {
                expect.errorMode = 'nested';
                expect.fail(
                    'expected {0} to contain property {1}',
                    subject,
                    valueKey
                );
            }
        });

        expect(subject, 'to equal', value);
    }
);

class CustomSpec {
    constructor(spec, value, isTopLevel = true, scope = null) {
        this.spec = spec;
        this.value = value;
        this.nested = !isTopLevel;
        this.scope = scope;
    }

    static applyScope(scope, expect) {
        expect.flags.not = scope.flags.not;
    }
}

function buildCustomSpecWrapper(Type, scope) {
    return (value) => {
        return new Type(value, undefined, false, scope);
    };
}

function registerUnexpectedTypeForCustomSpec(Type, options = {}) {
    baseExpect.addType({
        name: Type.name,
        base: 'object',
        identify: (value) => value instanceof Type,
        inspect:
            options.inspect !== undefined
                ? options.inspect
                : ({ spec, nested }, depth, output, inspect) => {
                      if (nested) output.text(`${Type.name}(`);
                      if (spec !== undefined) {
                          output.append(inspect(spec, depth));
                      }
                      if (nested) output.text(')');
                  },
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
        spec = spec.map((item) => {
            if (item instanceof CustomSpec) {
                return unpackNestedSpecs(expect, item);
            } else {
                return item;
            }
        });
    } else if (typeof spec === 'object' && spec !== null && !isRegExp(spec)) {
        spec = Object.assign({}, spec);
        Object.keys(spec).forEach((key) => {
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
    },
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
    return [subject, '[not] to contain'].concat(spec);
}

function isPresentIn(element, subject) {
    return subject.indexOf(element) > -1;
}

baseExpect.addAssertion(
    '<array> to equal <ArrayContainingSpec>',
    (expect, subject, { spec, scope }) => {
        if (scope !== null) CustomSpec.applyScope(scope, expect);

        spec = unpackNestedSpecs(expect, spec);

        // check if we are operating on a subset
        if (subject.length === spec.length) {
            // prefer "to satisfy" since we are not
            return expect(subject, '[not] to satisfy', spec);
        }

        try {
            // XXX workaround having no direct containing assertion
            expect.apply(expect, assertContainingArray(subject, spec));
        } catch (e) {
            const present = spec.filter((element) =>
                isPresentIn(element, subject)
            );

            expect(present, '[not] to equal', spec);
        }
    }
);

baseExpect.addAssertion('<jestMock> was [not] called', (expect, subject) => {
    expect.errorMode = 'bubble';
    expect(jestMockToSinonSpy(subject), 'was [not] called');
});

baseExpect.addAssertion(
    '<jestMock> [not] to have returned',
    (expect, subject) => {
        const { results } = subject.mock;

        const isValid = results.some((result) => !result.isThrow);

        expect(isValid, expect.flags.not ? 'to be false' : 'to be true');
    }
);

baseExpect.addAssertion(
    '<jestMock> [not] to have returned times <number>',
    (expect, subject, value) => {
        const { results } = subject.mock;

        let timesCount = 0;
        results.forEach((result) => {
            if (!result.isThrow) {
                timesCount += 1;
            }
        });

        expect.errorMode = 'nested';
        expect(
            timesCount,
            expect.flags.not
                ? 'to be less than'
                : 'to be greater than or equal to',
            value
        );
    }
);

baseExpect.addAssertion(
    '<jestMock> [not] to have returned with <any>',
    (expect, subject, value) => {
        expect.errorMode = 'nested';
        expect(subject, 'to have returned');

        const validResultValues = [];
        const { results } = subject.mock;
        results.forEach((call) => {
            if (!call.isThrow) {
                validResultValues.push(call.value);
            }
        });

        expect.errorMode = 'nested';
        expect(validResultValues, '[not] to contain', value);
    }
);

baseExpect.addAssertion(
    '<jestMock> [not] to have last returned with <any>',
    (expect, subject, value) => {
        const { results } = subject.mock;

        expect(
            subject,
            '[not] to have nth returned with',
            results.length,
            value
        );
    }
);

baseExpect.addAssertion(
    '<jestMock> [not] to have nth returned with <number> <any>',
    (expect, subject, n, value) => {
        const { results } = subject.mock;
        const index = n - 1;
        const nthResult =
            results.length >= index ? results[index] : { isThrow: true };

        expect.errorMode = 'nested';
        if (nthResult.isThrow) {
            expect.fail('expected {0} not to throw', subject);
        }
        expect(nthResult.value, '[not] to equal', value);
    }
);

baseExpect.addAssertion(
    '<jestMock> [not] to have been called times <number>',
    (expect, subject, value) => {
        if (expect.flags.not) {
            expect.errorMode = 'nested';
            expect(jestMockToSinonSpy(subject).callCount, 'not to be', value);
        }
        expect.errorMode = 'bubble';
        expect(jestMockToSinonSpy(subject), 'was [not] called times', value);
    }
);

class CalledWithSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(CalledWithSpec);

baseExpect.addAssertion(
    '<jestMock> [not] to have been called with <CalledWithSpec>',
    (expect, subject, { spec }) => {
        const spy = jestMockToSinonSpy(subject);
        const callArgs = spec.map((v) => unpackNestedSpecs(expect, v));

        expect(
            spy,
            expect.flags.not
                ? 'to have no calls satisfying'
                : 'to have a call satisfying',
            callArgs
        );
    }
);

baseExpect.addAssertion(
    '<jestMock> [not] to have been last called with <CalledWithSpec>',
    (expect, subject, calledWithSpec) => {
        calledWithSpec.value = subject.mock.calls.length;
        expect(subject, '[not] to have been nth called with', calledWithSpec);
    }
);

baseExpect.addAssertion(
    '<jestMock> [not] to have been nth called with <CalledWithSpec>',
    (expect, subject, { spec, value: n }) => {
        expect.errorMode = 'nested';
        if (n === 0) {
            // TODO: surface nested error output
            expect.fail('expected {0} was called', subject);
        }

        const callArgs = spec.map((v) => unpackNestedSpecs(expect, v));
        const { calls } = subject.mock;
        const index = n - 1;
        const nthCallArgs = calls[index];

        expect(nthCallArgs, '[not] to equal', callArgs);
    }
);

class ObjectContainingSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(ObjectContainingSpec);

baseExpect.addAssertion(
    '<object> [not] to equal <ObjectContainingSpec>',
    (expect, subject, { spec, nested, scope }) => {
        if (scope !== null) CustomSpec.applyScope(scope, expect);

        spec = unpackNestedSpecs(expect, spec);

        if (!nested) expect.errorMode = 'bubble';
        return expect(subject, '[not] to satisfy', spec);
    }
);

class StringContainingSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(StringContainingSpec);

baseExpect.addAssertion(
    '<string> to equal <StringContainingSpec>',
    (expect, subject, { spec, scope }) => {
        if (scope !== null) CustomSpec.applyScope(scope, expect);

        return expect(subject, '[not] to contain', spec);
    }
);

class ContainSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(ContainSpec);

baseExpect.addAssertion(
    '<any|array|string> [not] to contain (|equal) <ContainSpec>',
    (expect, subject, { spec }) => {
        const isIdentity = expect.alternations[0] !== 'equal';

        const subjectIsArray = Array.isArray(subject);
        if (subjectIsArray && isIdentity) {
            return expect(
                subject,
                '[not] to have an item satisfying to be',
                spec
            );
        } else if (
            (typeof subject === 'string' && typeof spec !== 'string') ||
            (!subjectIsArray &&
                typeof subject === 'object' &&
                typeof spec === 'string')
        ) {
            expect.fail({ message: '' });
        } else {
            return expect(subject, '[not] to contain', spec);
        }
    }
);

class MatchSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(MatchSpec);

baseExpect.addAssertion(
    '<Error|string> to match <MatchSpec>',
    (expect, subject, { spec }) => {
        const _subject = subject instanceof Error ? subject.message : subject;
        return expect(
            _subject,
            isRegExp(spec) ? 'to match' : 'to contain',
            spec
        );
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
        output.append(inspect(subject.value)),
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
            [property]: nestedObjects,
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
        if (Array.isArray(subject)) {
            return expect(subject, 'to contain', value);
        } else if (
            subject[value] === undefined &&
            Object.prototype.hasOwnProperty.call(subject, value)
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
    (expect, subject, { spec, scope }) => {
        if (scope !== null) CustomSpec.applyScope(scope, expect);

        return expect(subject, '[not] to match', spec);
    }
);

function defaultFlags(assertion, flags) {
    return flags.not ? `not ${assertion}` : assertion;
}

function expect(subject, ...rest) {
    if (rest.length > 0) {
        throw new Error('Expect takes at most one argument.');
    }

    const expect = baseExpect;
    const flags = { ...baseExpectFlags };
    let _promise = null;

    const _buildAssertion = (assertion, options = {}) => {
        const {
            numberOfArgs = 1,
            withFlags = defaultFlags,
            noWrapArgs = false,
            wrapValue = (v) => v,
        } = options;

        if (numberOfArgs === 1) {
            return (value) =>
                expect(subject, withFlags(assertion, flags), wrapValue(value));
        } else if (numberOfArgs === 0) {
            return () => expect(subject, withFlags(assertion, flags));
        } else if (numberOfArgs > 1 && noWrapArgs) {
            return (...args) =>
                expect(subject, withFlags(assertion, flags), ...args);
        } else if (numberOfArgs > 1) {
            return (...args) =>
                expect(subject, withFlags(assertion, flags), wrapValue(args));
        }
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

    const buildAssertionSomeArgs = (assertionOrOptions) => {
        let options;
        if (typeof assertionOrOptions === 'string') {
            options = {
                assertionOneArg: assertionOrOptions,
                assertionNoArgs: assertionOrOptions,
            };
        } else {
            options = assertionOrOptions;
        }

        const oneArg = buildAssertion(options.assertionOneArg, options);
        const noArgs = buildAssertion(
            options.assertionNoArgs,
            Object.assign({}, options, { numberOfArgs: 0 })
        );
        return (value) => (value === undefined ? noArgs() : oneArg(value));
    };

    const banVal =
        (fn) =>
        (...args) => {
            if (args.length === 0) {
                return fn();
            } else {
                expect.fail({ message: 'No values expected for assertion.' });
            }
        };

    const assertions = {
        toBe: buildAssertion('to be'),
        toBeCloseTo: buildAssertion('to be close to'),
        toBeDefined: buildAssertion('to be defined', { numberOfArgs: 0 }),
        toBeFalsy: banVal(buildAssertion('to be falsy', { numberOfArgs: 0 })),
        toBeGreaterThan: buildAssertion('to be greater than'),
        toBeGreaterThanOrEqual: buildAssertion(
            'to be greater than or equal to'
        ),
        toBeInstanceOf: buildAssertion('to be a'),
        toBeLessThan: buildAssertion('to be less than'),
        toBeLessThanOrEqual: buildAssertion('to be less than or equal to'),
        toBeNull: buildAssertion('to be null', { numberOfArgs: 0 }),
        toBeTruthy: banVal(buildAssertion('to be truthy', { numberOfArgs: 0 })),
        toBeUndefined: buildAssertion('to be undefined', { numberOfArgs: 0 }),
        toContain: buildAssertion('to contain', {
            wrapValue: (value) => new ContainSpec(value),
        }),
        toContainEqual: buildAssertion('to contain equal', {
            wrapValue: (value) => new ContainSpec(value),
        }),
        toEqual: buildAssertion('to equal'),
        toHaveBeenCalled: buildAssertion('was called', {
            numberOfArgs: 0,
            withFlags: (assertion) => {
                return flags.not ? 'was not called' : assertion;
            },
        }),
        toHaveBeenCalledTimes: buildAssertion('to have been called times'),
        toHaveBeenCalledWith: buildAssertion('to have been called with', {
            numberOfArgs: Infinity,
            wrapValue: (args) => new CalledWithSpec(args),
        }),
        toHaveBeenLastCalledWith: buildAssertion(
            'to have been last called with',
            {
                numberOfArgs: Infinity,
                wrapValue: (args) => new CalledWithSpec(args),
            }
        ),
        toHaveBeenNthCalledWith: buildAssertion(
            'to have been nth called with',
            {
                numberOfArgs: Infinity,
                wrapValue: ([value, ...args]) =>
                    new CalledWithSpec(args, value),
            }
        ),
        toHaveLength: buildAssertion('to have length'),
        toHaveProperty: buildAssertion('to have property', {
            numberOfArgs: 2,
            wrapValue: (args) => new KeyPathSpec(args),
        }),
        toHaveReturned: buildAssertion('to have returned', {
            numberOfArgs: 0,
        }),
        toHaveReturnedTimes: buildAssertion('to have returned times'),
        toHaveReturnedWith: buildAssertion('to have returned with'),
        toHaveLastReturnedWith: buildAssertion('to have last returned with'),
        toHaveNthReturnedWith: buildAssertion('to have nth returned with', {
            numberOfArgs: 2,
            noWrapArgs: true,
        }),
        toMatch: buildAssertion('to match', {
            wrapValue: (value) => new MatchSpec(value),
        }),
        toMatchObject: buildAssertion('to equal', {
            wrapValue: (value) => new ObjectContainingSpec(value),
        }),
        toMatchSnapshot: () => {
            throw new Error(
                'jest-unexpected: toMatchSnapshot() is not supported.'
            );
        },
        toMatchInlineSnapshot: () => {
            throw new Error(
                'jest-unexpected: toMatchInlineSnapshot() is not supported.'
            );
        },
        toStrictEqual: buildAssertion('to strict equal'),
        toThrow: buildAssertionSomeArgs('to throw'),
        toThrowErrorMatchingSnapshot: () => {
            throw new Error(
                'jest-unexpected: toThrowErrorMatchingSnapshot() is not supported.'
            );
        },
        toThrowErrorMatchingInlineSnapshot: () => {
            throw new Error(
                'jest-unexpected: toThrowErrorMatchingInlineSnapshot() is not supported.'
            );
        },
    };

    // <method aliases>
    assertions.toBeCalled = assertions.toHaveBeenCalled;
    assertions.toBeCalledTimes = assertions.toHaveBeenCalledTimes;
    assertions.toBeCalledWith = assertions.toHaveBeenCalledWith;
    assertions.lastCalledWith = assertions.toHaveBeenLastCalledWith;
    assertions.nthCalledWith = assertions.toHaveBeenNthCalledWith;
    assertions.toReturn = assertions.toHaveReturned;
    assertions.toReturnTimes = assertions.toHaveReturnedTimes;
    assertions.toReturnWith = assertions.toHaveReturnedWith;
    assertions.lastReturnedWith = assertions.toHaveLastReturnedWith;
    assertions.nthReturnedWith = assertions.toHaveNthReturnedWith;
    // </method aliases>

    const createChainedAssertionPromiseForState = (promiseState, toSubject) => {
        _promise = expect.promise(() => {
            return expect(
                subject,
                `to be ${promiseState} with`,
                expect.it((result) => {
                    subject = toSubject(result);
                })
            );
        });
        // attach the assertion methods to allow chaining on the output value
        Object.assign(_promise, assertions);
        // attach the negation operator
        Object.defineProperty(_promise, 'not', {
            get: () => {
                flags.not = true;
                return _promise;
            },
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
                    (result) => result
                );
                // override "to throw" for .resolves as it makes no sense
                resolves.toThrow = () => {
                    return _promise
                        .catch(() => {
                            // ignore any coming out of the promise to which we attached
                        })
                        .then(() => {
                            throw new Error(
                                'jest-unexpected: nonsensical .toThrow() while expecting .resolves'
                            );
                        });
                };
                return resolves;
            },
            get rejects() {
                const rejects = createChainedAssertionPromiseForState(
                    'rejected',
                    (result) => result
                );
                // override "to throw" for .rejects to allow asserting the captured error
                rejects.toThrow = buildAssertionSomeArgs({
                    assertionNoArgs: 'to be defined',
                    assertionOneArg: 'to match',
                    wrapValue: (value) => new MatchSpec(value),
                });
                return rejects;
            },
        },
        assertions
    );
}

// loudly mention unsupported methods
expect.addSnapshotSerializer = () => {
    throw new Error(
        'jest-unexpected: expect.addSnapshotSerializer() is not supported.'
    );
};
expect.extend = () => {
    throw new Error('jest-unexpected: expect.extend() is not supported.');
};
expect.any = buildCustomSpecWrapper(AnySpec);
expect.anything = buildCustomSpecWrapper(AnythingSpec);

class StructualComparisons {
    constructor({ flags = baseExpectFlags } = {}) {
        this.flags = { ...flags };
    }

    get arrayContaining() {
        return buildCustomSpecWrapper(ArrayContainingSpec, this);
    }

    get objectContaining() {
        return buildCustomSpecWrapper(ObjectContainingSpec, this);
    }

    get stringContaining() {
        return buildCustomSpecWrapper(StringContainingSpec, this);
    }

    get stringMatching() {
        return buildCustomSpecWrapper(StringMatchingSpec, this);
    }

    static register(comparisons, target) {
        const attachComparison = (propertyName) => {
            Object.defineProperty(target, propertyName, {
                get: () => comparisons[propertyName],
            });
        };

        // attach the comparisons as properties to the target object
        const prototype = Object.getPrototypeOf(comparisons);
        for (const propertyName of Object.getOwnPropertyNames(prototype)) {
            if (propertyName === 'constructor') continue;
            attachComparison(propertyName);
        }
    }
}

// expose structural comparisions
StructualComparisons.register(new StructualComparisons(), expect);

// return negated structural comparisons for top-level .not
Object.defineProperty(expect, 'not', {
    get: () => new StructualComparisons({ flags: { not: true } }),
});

// attach Unexpected output object to allow controlling e.g. terminal width
expect.output = baseExpect.output;

module.exports = expect;
