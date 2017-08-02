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

    describe('.not', () => {
        describe('toEqual()', () => {
            it('should compare strings failing', () => {
                unexpected(
                    () => expect('foo').not.toEqual('foo'),
                    'to throw',
                    "expected 'foo' not to equal 'foo'"
                );
            });

            it('should compare strings', () => {
                unexpected(
                    () => expect('foo').not.toEqual('bar'),
                    'not to throw'
                );
            });
        });
    });
});
