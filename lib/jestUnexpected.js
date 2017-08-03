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

    return {
        toBe: buildAssertion('to be'),
        toEqual: buildAssertion('to equal'),
        toMatch: buildAssertion('to jest match'),
        get not() {
            flags.not = true;
            return this;
        },
        get resolves() {
            expect.errorMode = 'bubble';

            return expect(subject, 'to be fulfilled with', (result) => {
                subject = result;
            }).then(() => this);
        },
        get rejects() {
            expect.errorMode = 'bubble';

            return expect(subject, 'to be rejected with', (result) => {
                subject = result !== undefined ? result.message : undefined;
            }).then(() => this);
        }
    };
};
