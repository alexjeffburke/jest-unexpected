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

const ArrayContainingSpec = instantiateCustomSpec('ArrayContaining');

function assertContainingArray(subject, spec) {
    /* XXX workaround Unexpected having no direct containing assertion */

    // start a containing assertion
    let nextAssertion = [subject, 'to contain'];

    // flatten out array of elements to check for
    nextAssertion = nextAssertion.concat(spec);

    return nextAssertion;
}

function isPresentIn(element, subject) {
    return subject.indexOf(element) > -1;
}

baseExpect.addAssertion(
    '<array> to equal <ArrayContainingSpec>',
    (expect, subject, { spec }) => {
        let hasChildSpecs = false;
        // check for and unpack nested specs
        spec = spec.map(item => {
            if (item instanceof CustomSpec) {
                hasChildSpecs = true;
                return item.spec;
            } else {
                return item;
            }
        });
        // compare the unpacked specs if found
        if (hasChildSpecs) {
            return expect(subject, 'to satisfy', spec);
        }

        try {
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
    (expect, subject, { spec }) => {
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

function toCustomSpec(type) {
    return value => new CustomSpec(type, value);
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

    const buildAssertionTwoArgs = assertion => {
        return value => {
            return expect(subject, withFlags(assertion, flags));
        };
    };

    const buildAssertionSomeArgs = assertion => {
        const oneArg = buildAssertion(assertion);
        const noArgs = buildAssertionTwoArgs(assertion);

        return value => (value === undefined ? noArgs() : oneArg(value));
    };

    const buildAssertionWithCustomSpec = (assertion, type) => {
        const assertionFn = buildAssertion(assertion);
        const wrapperFn = toCustomSpecWithConstraint(type);

        return (value, constraint) => assertionFn(wrapperFn(value, constraint));
    };

    return {
        toBe: buildAssertion('to be'),
        toBeDefined: buildAssertionTwoArgs('to be defined'),
        toBeFalsy: buildAssertionTwoArgs('to be falsy'),
        toBeGreaterThan: buildAssertion('to be greater than'),
        toBeNull: buildAssertionTwoArgs('to be null'),
        toBeTruthy: buildAssertionTwoArgs('to be truthy'),
        toContain: buildAssertionWithCustomSpec('to contain', IdentitySpec),
        toContainEqual: buildAssertion('to contain'),
        toEqual: buildAssertion('to equal'),
        toHaveLength: buildAssertion('to have length'),
        toHaveProperty: buildAssertionWithCustomSpec(
            'to have property',
            KeyPathSpec
        ),
        toMatch: buildAssertion('to jest match'),
        toMatchObject: buildAssertion('to satisfy'),
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

module.exports.arrayContaining = toCustomSpec(ArrayContainingSpec);
module.exports.objectContaining = toCustomSpec(ObjectContainingSpec);
module.exports.stringContaining = toCustomSpec(StringContainingSpec);
module.exports.stringMatching = toCustomSpec(StringMatchingSpec);
