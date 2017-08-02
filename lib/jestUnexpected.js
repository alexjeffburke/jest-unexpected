const unexpected = require('unexpected');

module.exports = function expect(subject) {
    const expect = unexpected.clone();
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
        get not() {
            flags.not = true;
            return this;
        }
    };
};
