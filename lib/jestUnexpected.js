const unexpected = require('unexpected');
const baseExpect = unexpected.clone();

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
    constructor(type, spec, value, isTopLevel = false) {
        this.type = type;
        this.spec = spec;
        this.value = value;
        this.nested = !isTopLevel;
    }
}

function instantiateCustomSpec(baseName) {
    const specName = `${baseName}Spec`;

    baseExpect.addType({
        name: specName,
        base: 'object',
        identify: isCustomSpecOfType(specName),
        inspect: ({ spec, nested }, depth, output, inspect) => {
            if (nested) output.text(`${specName}(`);
            output.append(inspect(spec, depth));
            if (nested) output.text(')');
        }
    });

    return specName;
}

function isCustomSpecOfType(type) {
    return value => value instanceof CustomSpec && value.type === type;
}

function unpackNestedSpec(expect, { args, spec }) {
    return args !== undefined ? expect.it(...args) : spec;
}

function unpackNestedSpecs(expect, spec) {
    if (Array.isArray(spec)) {
        spec = spec.map(item => {
            if (item instanceof CustomSpec) {
                return unpackNestedSpec(expect, item);
            } else {
                return item;
            }
        });
    } else if (typeof spec === 'object' && spec !== null) {
        spec = Object.assign({}, spec);
        Object.keys(spec).forEach(key => {
            const value = spec[key];
            if (value instanceof CustomSpec) {
                spec[key] = unpackNestedSpec(expect, value);
            }
        });
    }

    return spec;
}

const AnySpec = instantiateCustomSpec('Any');

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

class CustomAnySpec extends CustomSpec {
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

baseExpect.addAssertion(
    '<any> to equal <AnySpec>',
    (expect, subject, anySpec) => {
        expect.errorMode = 'bubble';
        return expect(subject, ...anySpec.args);
    }
);

const ArrayContainingSpec = instantiateCustomSpec('ArrayContaining');

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

const ObjectContainingSpec = instantiateCustomSpec('ObjectContaining');

baseExpect.addAssertion(
    '<object> to equal <ObjectContainingSpec>',
    (expect, subject, { spec, nested }) => {
        spec = unpackNestedSpecs(expect, spec);

        if (!nested) expect.errorMode = 'bubble';
        return expect(subject, 'to satisfy', spec);
    }
);

const StringContainingSpec = instantiateCustomSpec('StringContaining');

baseExpect.addAssertion(
    '<string> to equal <StringContainingSpec>',
    (expect, subject, { spec }) => {
        return expect(subject, 'to contain', spec);
    }
);

const IdentitySpec = instantiateCustomSpec('Identity');

baseExpect.addAssertion(
    '<array> to contain <IdentitySpec>',
    (expect, subject, { spec }) => {
        expect.errorMode = 'diff';
        return expect(subject, 'to have an item satisfying to be', spec);
    }
);

const KeyPathSpec = instantiateCustomSpec('KeyPath');

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

const StringMatchingSpec = instantiateCustomSpec('StringMatching');

baseExpect.addAssertion(
    '<string> to equal <StringMatchingSpec>',
    (expect, subject, { spec }) => {
        return expect(subject, 'to match', spec);
    }
);

function toCustomSpec(type, Type = CustomSpec) {
    return value => new Type(type, value);
}

function toCustomSpecWithConstraint(type) {
    return (value, constraint) => new CustomSpec(type, value, constraint, true);
}

function withFlags(assertion, flags) {
    return flags.not ? `not ${assertion}` : assertion;
}

module.exports = function expect(subject) {
    const expect = baseExpect;
    const flags = {
        not: false
    };

    const buildAssertion = assertion => {
        return value => {
            return expect(subject, withFlags(assertion, flags), value);
        };
    };

    const buildAssertionNoArgs = assertion => {
        return value => {
            return expect(subject, withFlags(assertion, flags));
        };
    };

    const buildAssertionSomeArgs = assertion => {
        const oneArg = buildAssertion(assertion);
        const noArgs = buildAssertionNoArgs(assertion);

        return value => (value === undefined ? noArgs() : oneArg(value));
    };

    const buildAssertionWithCustomSpec = (assertion, type) => {
        const assertionFn = buildAssertion(assertion);
        const wrapperFn = toCustomSpecWithConstraint(type);

        return (value, constraint) => assertionFn(wrapperFn(value, constraint));
    };

    return {
        toBe: buildAssertion('to be'),
        toBeDefined: buildAssertionNoArgs('to be defined'),
        toBeFalsy: buildAssertionNoArgs('to be falsy'),
        toBeGreaterThan: buildAssertion('to be greater than'),
        toBeGreaterThanOrEqual: buildAssertion(
            'to be greater than or equal to'
        ),
        toBeInstanceOf: buildAssertion('to be a'),
        toBeLessThan: buildAssertion('to be less than'),
        toBeLessThanOrEqual: buildAssertion('to be less than or equal to'),
        toBeNull: buildAssertionNoArgs('to be null'),
        toBeTruthy: buildAssertionNoArgs('to be truthy'),
        toContain: buildAssertionWithCustomSpec('to contain', IdentitySpec),
        toContainEqual: buildAssertion('to contain'),
        toEqual: buildAssertion('to equal'),
        toHaveLength: buildAssertion('to have length'),
        toHaveProperty: buildAssertionWithCustomSpec(
            'to have property',
            KeyPathSpec
        ),
        toMatch: buildAssertion('to jest match'),
        toMatchObject: buildAssertionWithCustomSpec(
            'to equal',
            ObjectContainingSpec
        ),
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

module.exports.any = toCustomSpec(AnySpec, CustomAnySpec);
module.exports.arrayContaining = toCustomSpec(ArrayContainingSpec);
module.exports.objectContaining = toCustomSpec(ObjectContainingSpec);
module.exports.stringContaining = toCustomSpec(StringContainingSpec);
module.exports.stringMatching = toCustomSpec(StringMatchingSpec);
