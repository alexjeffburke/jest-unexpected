const unexpected = require('unexpected');

module.exports = function expect(subject) {
    const expect = unexpected.clone();
    const flags = {
        not: false
    };

    return {
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
