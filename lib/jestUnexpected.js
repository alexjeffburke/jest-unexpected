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

class ArrayContainingSpec {
    constructor(spec) {
        this.spec = spec;
    }
}

baseExpect.addType({
    name: 'ArrayContainingSpec',
    base: 'array-like',
    identify: value => value instanceof ArrayContainingSpec,
    inspect: (subject, depth, output, inspect) =>
        output
            .text(`ArrayContainingSpec(`)
            .append(inspect(subject.spec, depth))
            .text(')')
});

function assertContainingArray(subject, spec) {
    /* XXX workaround Unexpected having no direct containing assertion */

    // start a containing assertion
    let nextAssertion = [subject, 'to contain'];

    // flatten out array of elements to check for
    nextAssertion = nextAssertion.concat(spec);

    return nextAssertion;
}

baseExpect.addAssertion(
    '<array> to equal <ArrayContainingSpec>',
    (expect, subject, { spec }) => {
        return expect.apply(expect, assertContainingArray(subject, spec));
    }
);

class ObjectContainingSpec {
    constructor(spec) {
        this.spec = spec;
    }
}

baseExpect.addType({
    name: 'ObjectContainingSpec',
    base: 'object',
    identify: value => value instanceof ObjectContainingSpec,
    inspect: (objCon, depth, output, inspect) =>
        output
            .text('ObjectContainingSpec(')
            .append(inspect(objCon.spec, depth))
            .text(')')
});

baseExpect.addAssertion(
    '<object> to equal <ObjectContainingSpec>',
    (expect, subject, { spec }) => {
        return expect(subject, 'to satisfy', spec);
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

    return {
        toBe: buildAssertion('to be'),
        toBeDefined: buildAssertionTwoArgs('to be defined'),
        toEqual: buildAssertion('to equal'),
        toMatch: buildAssertion('to jest match'),
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

module.exports.arrayContaining = spec => new ArrayContainingSpec(spec);
module.exports.objectContaining = spec => new ObjectContainingSpec(spec);
