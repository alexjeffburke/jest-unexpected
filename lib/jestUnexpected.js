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

function isSignatureError(e) {
    return e
        .toString()
        .match('The assertion does not have a matching signature');
}

function jestOutput(jestName, subject, intended) {
    let describeSubject;

    switch (Object.prototype.toString.call(subject)) {
        case '[object Array]':
            describeSubject = 'array';
    }

    return output => {
        output
            .gray('expect(')
            .red(`${intended}`)
            .gray(`)[.not].${jestName}(`)
            .green('expected')
            .gray(')')
            .nl()
            .nl()
            .red(`${intended}`)
            .text(' value must be a string.')
            .nl()
            .text('Received:')
            .nl()
            .text(`  ${describeSubject}: `)
            .appendInspected(subject);
    };
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

    function wrapError(jestName, assertFn) {
        return expect.withError(
            assertFn,
            e => {
                if (isSignatureError(e)) {
                    expect.fail(jestOutput(jestName, subject, 'string'));
                } else {
                    throw e;
                }
            }
        );
    }

    const asserts = {
        toBe: buildAssertion('to be'),
        toEqual: buildAssertion('to equal'),
        toMatch: buildAssertion('to jest match'),
        get not() {
            flags.not = true;
            return this;
        }
    };

    Object.keys(asserts).forEach(key => {
        if (key === 'not') return;

        const assertFn = asserts[key];

        asserts[key] = value => {
            return wrapError(key, () => {
                assertFn(value);
            });
        };
    });

    return asserts;
};
