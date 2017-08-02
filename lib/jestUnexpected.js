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
        return expect(subject, 'to satisfy', value);
    }
);

module.exports = function expect(subject) {
    const expect = baseExpect;
    const flags = {
        not: false
    };

    return {
        toBe: value => {
            return expect(
                subject,
                flags.not ? 'not to be' : 'to be',
                value
            );
        },
        toEqual: value => {
            return expect(
                subject,
                flags.not ? 'not to equal' : 'to equal',
                value
            );
        },
        toMatch: value => {
            return expect(subject, 'to jest match', value);
        },
        get not() {
            flags.not = true;
            return this;
        }
    };
};
