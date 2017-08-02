const unexpected = require('unexpected');

module.exports = function expect(subject) {
    const expect = unexpected.clone();

    return {
        toEqual: value => {
            return expect(subject, 'to equal', value);
        }
    };
};
