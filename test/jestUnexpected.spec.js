const expect = require('../lib/jestUnexpected');
const unexpected = require('unexpected');

describe('jest-unexpected', () => {
    describe('toBe()', () => {
        it('should compare instances failing', () => {
            unexpected(
                () => expect({}).toBe({}),
                'to throw',
                'expected {} to be {}'
            );
        });

        it('should compare instances', () => {
            const instance = {};

            unexpected(() => expect(instance).toBe(instance), 'not to throw');
        });

        describe('.not', () => {
            it('should compare instances failing', () => {
                const instance = {};

                unexpected(
                    () => expect(instance).not.toBe(instance),
                    'to throw',
                    'expected {} not to be {}'
                );
            });

            it('should compare instances', () => {
                unexpected(() => expect({}).not.toBe({}), 'not to throw');
            });
        });
    });

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

        describe('.not', () => {
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
