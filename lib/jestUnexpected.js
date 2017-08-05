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

class ContainingSpec {
    constructor(spec) {
        this.spec = spec;
    }
}

baseExpect.addType({
    name: 'ContainingSpec',
    base: 'object',
    identify: value => value instanceof ContainingSpec,
    inspect: (subject, depth, output, inspect) => {
        const baseName = Array.isArray(subject.spec) ? 'Array' : 'Object';

        output
            .text(`${baseName}ContainingSpec(`)
            .append(inspect(subject.spec, depth))
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

class IdentitySpec {
    constructor(spec) {
        this.spec = spec;
    }
}

baseExpect.addType({
    name: 'IdentitySpec',
    base: 'object',
    identify: value => value instanceof IdentitySpec,
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

function withFlags(assertion, flags) {
    return flags.not ? `not ${assertion}` : assertion;
}

function wrapValue(Type, valueFn) {
    return value => valueFn(new Type(value));
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
        toBeFalsy: buildAssertionTwoArgs('to be falsy'),
        toBeTruthy: buildAssertionTwoArgs('to be truthy'),
        toContain: wrapValue(IdentitySpec, buildAssertion('to contain')),
        toContainEqual: buildAssertion('to contain'),
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

module.exports.arrayContaining = spec => new ContainingSpec(spec);
module.exports.objectContaining = spec => new ContainingSpec(spec);
