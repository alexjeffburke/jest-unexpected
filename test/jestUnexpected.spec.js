const expect = require('../lib/jestUnexpected');
const unexpected = require('unexpected');

describe('jest-unexpected', () => {
    describe('toEqual()', () => {
        it('should compare strings failing', () => {
            unexpected(
                () => expect('foo').toEqual('bar'),
                'to throw',
                "expected 'foo' to equal 'bar'\n" + '\n' + '-foo\n' + '+bar'
            );
        });

        it('should compare strings', () => {
            unexpected(() => expect('foo').toEqual('foo'), 'not to throw');
        });
    });
});
