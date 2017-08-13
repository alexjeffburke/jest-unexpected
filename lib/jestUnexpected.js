const unexpected = require('unexpected');
const baseExpect = unexpected.clone();

// pull in plugin for -sinon assertions
baseExpect.use(require('unexpected-sinon'));

baseExpect.addAssertion(
    '<string> to jest match <string>',
    (expect, subject, value) => {
        expect.errorMode = 'bubble';
        return expect(subject, 'to contain', value);
    }
);

baseExpect.addAssertion(
    '<string> to jest match <regexp>',
    (expect, subject, value) => {
        expect.errorMode = 'bubble';
        return expect(subject, 'to match', value);
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

function registerUnexpectedTypeForCustomSpec(Type) {
    baseExpect.addType({
        name: Type.name,
        base: 'object',
        identify: value => value instanceof Type,
        inspect: ({ spec, nested }, depth, output, inspect) => {
            if (nested) output.text(`${Type.name}(`);
            output.append(inspect(spec, depth));
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
registerUnexpectedTypeForCustomSpec(AnySpec);

baseExpect.addAssertion(
    '<any> to equal <AnySpec>',
    (expect, subject, anySpec) => {
        expect.errorMode = 'bubble';
        return expect(subject, ...anySpec.args);
    }
);

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

class KeyPathSpec extends CustomSpec {}
registerUnexpectedTypeForCustomSpec(KeyPathSpec);

function keyPathToNestedObjects(keyPathString, keyPathValue) {
    const keyPath = keyPathString.split('.');
    // the innermost property will point to a value
    let nestedObjects = keyPathValue;

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
    '<object> to have property <KeyPathSpec>',
    (expect, subject, { spec, value }) => {
        if (value === undefined) {
            value = expect.it('to be defined');
        }

        expect.errorMode = 'default';
        return expect(
            subject,
            'to satisfy',
            keyPathToNestedObjects(spec, value)
        );
    }
);

baseExpect.addAssertion(
    '<object> to satisfy <KeyPathSpec>',
    (expect, subject, { spec, value }) => {
        if (value === undefined) {
            value = expect.it('to be defined');
        }

        expect.errorMode = 'default';
        return expect(
            subject,
            'to satisfy',
            keyPathToNestedObjects(spec, value)
        );
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

function withFlags(assertion, flags) {
    return flags.not ? `not ${assertion}` : assertion;
}

module.exports = function expect(subject) {
    const expect = baseExpect;
    const flags = {
        not: false
    };

    const buildAssertion = (assertion, options = {}) => {
        const { numberOfArgs = 1, wrapValue = v => v } = options;

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

    const buildAssertionSomeArgs = assertion => {
        const oneArg = buildAssertion(assertion);
        const noArgs = buildAssertion(assertion, { numberOfArgs: 0 });

        return value => (value === undefined ? noArgs() : oneArg(value));
    };

    return {
        toBe: buildAssertion('to be'),
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
        toContain: buildAssertion('to contain', {
            wrapValue: value => new IdentitySpec(value)
        }),
        toContainEqual: buildAssertion('to contain'),
        toEqual: buildAssertion('to equal'),
        toHaveBeenCalled: buildAssertion('was called', { numberOfArgs: 0 }),
        toHaveBeenCalledTimes: buildAssertion('was called times'),
        toHaveBeenCalledWith: buildAssertion('to have been called with', {
            numberOfArgs: Infinity,
            wrapValue: args => new CalledWithSpec(args)
        }),
        toHaveLength: buildAssertion('to have length'),
        toHaveProperty: buildAssertion('to have property', {
            numberOfArgs: 2,
            wrapValue: args => new KeyPathSpec(args[0], args[1])
        }),
        toMatch: buildAssertion('to jest match'),
        toMatchObject: buildAssertion('to equal', {
            wrapValue: value => new ObjectContainingSpec(value)
        }),
        toThrow: buildAssertionSomeArgs('to throw'),
        get not() {
            flags.not = true;
            return this;
        },
        get resolves() {
            return expect(subject, 'to be fulfilled with', result => {
                subject = result;
            }).then(() => this);
        },
        get rejects() {
            return expect(subject, 'to be rejected with', result => {
                subject = result !== undefined ? result.message : undefined;
            }).then(() => this);
        }
    };
};

module.exports.any = buildCustomSpecWrapper(AnySpec);
module.exports.arrayContaining = buildCustomSpecWrapper(ArrayContainingSpec);
module.exports.objectContaining = buildCustomSpecWrapper(ObjectContainingSpec);
module.exports.stringContaining = buildCustomSpecWrapper(StringContainingSpec);
module.exports.stringMatching = buildCustomSpecWrapper(StringMatchingSpec);
