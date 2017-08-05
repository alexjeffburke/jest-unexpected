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
    constructor(type, spec, value) {
        this.type = type;
        this.spec = spec;
        this.value = value;
    }
}

function isCustomSpecOfType(type) {
    return value => value instanceof CustomSpec && value.type === type;
}

baseExpect.addType({
    name: 'ContainingSpec',
    base: 'object',
    identify: isCustomSpecOfType('containing'),
    inspect: ({ spec }, depth, output, inspect) => {
        let baseName;
        if (typeof spec === 'string') {
            baseName = 'String';
        } else if (Array.isArray(spec)) {
            baseName = 'Array';
        } else {
            baseName = 'Object';
        }

        output
            .text(`${baseName}ContainingSpec(`)
            .append(inspect(spec, depth))
            .text(')');
    }
});

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
    '<array> to equal <ContainingSpec>',
    (expect, subject, { spec }) => {
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

baseExpect.addAssertion(
    '<object> to equal <ContainingSpec>',
    (expect, subject, { spec }) => {
        return expect(subject, 'to satisfy', spec);
    }
);

baseExpect.addAssertion(
    '<string> to equal <ContainingSpec>',
    (expect, subject, { spec }) => {
        return expect(subject, 'to contain', spec);
    }
);

baseExpect.addType({
    name: 'IdentitySpec',
    base: 'object',
    identify: isCustomSpecOfType('identity'),
    inspect: (subject, depth, output, inspect) =>
        output.append(inspect(subject.spec, depth))
});

baseExpect.addAssertion(
    '<array> to contain <IdentitySpec>',
    (expect, subject, { spec }) => {
        expect.errorMode = 'diff';
        return expect(subject, 'to have an item satisfying to be', spec);
    }
);

baseExpect.addType({
    name: 'KeyPathSpec',
    base: 'object',
    identify: isCustomSpecOfType('keypath'),
    inspect: (subject, depth, output, inspect) => {
        output.append(inspect(subject.spec, depth));
    }
});

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

function toCustomSpec(type) {
    return value => new CustomSpec(type, value);
}

function toCustomSpecWithConstraint(type) {
    return (value, constraint) => new CustomSpec(type, value, constraint);
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
        toBeNull: buildAssertionTwoArgs('to be null'),
        toBeTruthy: buildAssertionTwoArgs('to be truthy'),
        toContain: buildAssertionWithCustomSpec('to contain', 'identity'),
        toContainEqual: buildAssertion('to contain'),
        toEqual: buildAssertion('to equal'),
        toHaveLength: buildAssertion('to have length'),
        toHaveProperty: buildAssertionWithCustomSpec(
            'to have property',
            'keypath'
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

module.exports.arrayContaining = toCustomSpec('containing');
module.exports.objectContaining = toCustomSpec('containing');
module.exports.stringContaining = toCustomSpec('containing');
