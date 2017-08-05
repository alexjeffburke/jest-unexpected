const jestExpect = global.expect;
const expect = require('../lib/jestUnexpected');
const unexpected = require('unexpected');

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

describe('toBeDefined()', () => {
    it('should check defined failing', () => {
        unexpected(
            () => expect(undefined).toBeDefined(),
            'to throw',
            'expected undefined to be defined'
        );
    });

    it('should check defined', () => {
        unexpected(() => expect({}).toBeDefined(), 'not to throw');
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
            unexpected(() => expect('foo').not.toEqual('bar'), 'not to throw');
        });
    });
});

describe('toMatch()', () => {
    describe('with string subject', () => {
        describe('string', () => {
            it('should match two strings', () => {
                unexpected(() => expect('foo').toMatch('foo'), 'not to throw');
            });

            it('should match two different strings', () => {
                unexpected(
                    () => expect('foo').toMatch('bar'),
                    'to throw',
                    "expected 'foo' to contain 'bar'\n" + '\n' + 'foo'
                );
            });
        });

        it('should it substring match?', () => {
            unexpected(() => expect('foobar').toMatch('foo'), 'not to throw');
            unexpected(() => expect('foobar').toMatch('bar'), 'not to throw');
        });

        describe('with regex', () => {
            it('passing', () => {
                unexpected(
                    () => expect('foobar').toMatch(/foo/),
                    'not to throw'
                );
                unexpected(
                    () => expect('foobar').toMatch(/bar/),
                    'not to throw'
                );
            });

            it('failing', () => {
                unexpected(
                    () => expect('foo').toMatch(/bar/),
                    'to throw',
                    "expected 'foo' to match /bar/"
                );
            });
        });
    });

    describe.skip('with non-string subject', () => {
        it('should give a meaningful error', () => {
            try {
                jestExpect(['foo']).toMatch('foo');
                throw new Error('expected jest to throw :-(');
            } catch (e) {
                if (/to throw :-/.test(e.message)) throw e;
                unexpected(
                    () => expect(['foo']).toMatch('foo'),
                    'to throw',
                    e.message
                );
            }
        });
    });
});

describe('toThrow()', () => {
    it('should pass on throw', () => {
        return unexpected(() => {
            expect(() => {
                throw new Error();
            }).toThrow();
        }, 'not to error');
    });

    it('should pass with string', () => {
        return unexpected(() => {
            expect(() => {
                throw new Error('baz');
            }).toThrow('baz');
        }, 'not to error');
    });

    it('should pass with regex', () => {
        return unexpected(() => {
            expect(() => {
                throw new Error('bazbazbaz');
            }).toThrow(/baz/);
        }, 'not to error');
    });

    it('should pass with error', () => {
        return unexpected(() => {
            expect(() => {
                throw new Error('erroneous baz');
            }).toThrow(new Error('erroneous baz'));
        }, 'not to error');
    });

    it('should fail on no throw', () => {
        return unexpected(
            () => {
                expect(() => {}).toThrow();
            },
            'to error',
            'expected () => {} to throw' + '\n' + '  did not throw'
        );
    });

    it('should fail on mismatch string', () => {
        return unexpected(
            () => {
                expect(() => {
                    throw new Error('baz');
                }).toThrow('ba');
            },
            'to error',
            "expected () => { throw new Error('baz'); } to throw 'ba'\n" +
                "  expected Error('baz') to satisfy 'ba'\n" +
                '\n' +
                '  -baz\n' +
                '  +ba'
        );
    });

    it('should fail on mismatch regex', () => {
        return unexpected(
            () => {
                expect(() => {
                    throw new Error('baz');
                }).toThrow(/bar/);
            },
            'to error',
            "expected () => { throw new Error('baz'); } to throw /bar/\n" +
                "  expected Error('baz') to satisfy /bar/"
        );
    });

    it('should fail on mismatch error', () => {
        return unexpected(
            () => {
                expect(() => {
                    throw new Error('baz');
                }).toThrow(new Error('bar'));
            },
            'to error',
            "expected () => { throw new Error('baz'); } to throw Error('bar')\n" +
                "  expected Error('baz') to satisfy Error('bar')\n" +
                '\n' +
                '  Error({\n' +
                "    message: 'baz' // should equal 'bar'\n" +
                '                   //\n' +
                '                   // -baz\n' +
                '                   // +bar\n' +
                '  })'
        );
    });
});

describe('.resolves', () => {
    it('should pass on resolved promise and allow further assertions', () => {
        const resolutionValue = ['foo', 'bar'];

        return unexpected(
            expect(Promise.resolve(resolutionValue)).resolves,
            'to be fulfilled with',
            result => {
                expect(result, 'not to be', resolutionValue);

                return unexpected(() => {
                    result.toEqual(resolutionValue);
                }, 'not to error');
            }
        );
    });

    it('should fail on rejected promised and allow further assertions', () => {
        const rejectionValue = new Error('foobar');

        return unexpected(
            expect(Promise.reject(rejectionValue)).resolves,
            'to be rejected'
        );
    });
});

describe('.rejects', () => {
    it('should pass on resolved promise and allow further assertions', () => {
        const rejectionValue = new Error('foo and bar');

        return unexpected(
            expect(Promise.reject(rejectionValue)).rejects,
            'to be fulfilled with',
            result => {
                expect(result, 'not to be', rejectionValue);

                return unexpected(() => {
                    result.toMatch('and bar');
                }, 'not to error');
            }
        );
    });

    it('should fail on rejected promised and allow further assertions', () => {
        return unexpected(
            expect(Promise.resolve({})).rejects,
            'to be rejected'
        );
    });
});

describe('expect.objectContaining', () => {
    it('should pass', () => {
        unexpected(
            () =>
                expect({ foo: 'bar', baz: 'qux' }).toEqual(
                    expect.objectContaining({ foo: 'bar' })
                ),
            'not to throw'
        );
    });

    it('should fail', () => {
        unexpected(
            () =>
                expect({ foo: 'barbar', baz: 'qux' }).toEqual(
                    expect.objectContaining({ foo: 'bar' })
                ),
            'to error',
            [
                "expected { foo: 'barbar', baz: 'qux' }",
                "to equal ObjectContainingSpec({ foo: 'bar' })",
                '',
                '{',
                "  foo: 'barbar', // should equal 'bar'",
                '                 //',
                '                 // -barbar',
                '                 // +bar',
                "  baz: 'qux'",
                '}'
            ].join('\n')
        );
    });
});
