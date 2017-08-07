const jestExpect = global.expect;
const expect = require('../lib/jestUnexpected');
const trim = require('./utils/trim');
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

describe('toBeFalsy()', () => {
    it('should pass undefined', () => {
        unexpected(() => expect(undefined).toBeFalsy(), 'not to throw');
    });

    it('should pass null', () => {
        unexpected(() => expect(null).toBeFalsy(), 'not to throw');
    });

    it('should pass empty string', () => {
        unexpected(() => expect('').toBeFalsy(), 'not to throw');
    });

    it('should pass 0', () => {
        unexpected(() => expect(0).toBeFalsy(), 'not to throw');
    });

    it('should fail', () => {
        unexpected(
            () => expect({}).toBeFalsy(),
            'to throw',
            'expected {} to be falsy'
        );
    });
});

describe('toBeGreaterThan()', () => {
    it('should pass', () => {
        unexpected(() => expect(11).toBeGreaterThan(10), 'not to throw');
    });

    it('should fail', () => {
        unexpected(
            () => expect(10).toBeGreaterThan(10),
            'to throw',
            'expected 10 to be greater than 10'
        );
    });
});

describe('toBeGreaterThanOrEqual()', () => {
    it('should pass', () => {
        unexpected(() => expect(10).toBeGreaterThanOrEqual(10), 'not to throw');
    });

    it('should fail', () => {
        unexpected(
            () => expect(9).toBeGreaterThanOrEqual(10),
            'to throw',
            'expected 9 to be greater than or equal to 10'
        );
    });
});

describe('toBeInstanceOf()', () => {
    it('should pass', () => {
        unexpected(
            () => expect(() => {}).toBeInstanceOf(Function),
            'not to throw'
        );
    });

    it('should fail', () => {
        unexpected(
            () => expect({}).toBeInstanceOf(Function),
            'to throw',
            'expected {} to be a Function'
        );
    });
});

describe('toBeLessThan()', () => {
    it('should pass', () => {
        unexpected(() => expect(10).toBeLessThan(11), 'not to throw');
    });

    it('should fail', () => {
        unexpected(
            () => expect(10).toBeLessThan(10),
            'to throw',
            'expected 10 to be less than 10'
        );
    });
});

describe('toBeLessThanOrEqual()', () => {
    it('should pass', () => {
        unexpected(() => expect(10).toBeLessThanOrEqual(10), 'not to throw');
    });

    it('should fail', () => {
        unexpected(
            () => expect(11).toBeLessThanOrEqual(10),
            'to throw',
            'expected 11 to be less than or equal to 10'
        );
    });
});

describe('toBeNull()', () => {
    it('should pass', () => {
        unexpected(() => expect(null).toBeNull(), 'not to throw');
    });

    it('should fail', () => {
        unexpected(
            () => expect(undefined).toBeNull(),
            'to throw',
            'expected undefined to be null'
        );
    });
});

describe('toBeTruthy()', () => {
    it('should pass', () => {
        unexpected(() => expect({}).toBeTruthy(), 'not to throw');
    });

    it('should fail undefined', () => {
        unexpected(
            () => expect(undefined).toBeTruthy(),
            'to throw',
            'expected undefined to be truthy'
        );
    });

    it('should fail null', () => {
        unexpected(
            () => expect(null).toBeTruthy(),
            'to throw',
            'expected null to be truthy'
        );
    });

    it('should fail empty string', () => {
        unexpected(
            () => expect('').toBeTruthy(),
            'to throw',
            "expected '' to be truthy"
        );
    });

    it('should fail 0', () => {
        unexpected(
            () => expect(0).toBeTruthy(),
            'to throw',
            'expected 0 to be truthy'
        );
    });
});

describe('toContain()', () => {
    it('should pass', () => {
        const instance = { a: 'something' };

        unexpected(
            () =>
                expect([{ foo: 'bar' }, instance, { quux: 'xuuq' }]).toContain(
                    instance
                ),
            'not to throw'
        );
    });

    it('should fail', () => {
        const instance = { a: 'something' };
        const clonedInstance = Object.assign({}, instance);

        unexpected(
            () =>
                expect([{ foo: 'bar' }, instance, { quux: 'xuuq' }]).toContain(
                    clonedInstance
                ),
            'to throw',
            trim`
                expected [ { foo: 'bar' }, { a: 'something' }, { quux: 'xuuq' } ]
                to contain { a: 'something' }
            `
        );
    });
});

describe('toContainEqual()', () => {
    it('should pass', () => {
        const instance = { a: 'something', b: 'else' };
        const clonedInstance = Object.assign({}, instance);

        unexpected(
            () =>
                expect([
                    { foo: 'bar' },
                    instance,
                    { quux: 'xuuq' }
                ]).toContainEqual(clonedInstance),
            'not to throw'
        );
    });

    it('should fail', () => {
        unexpected(
            () =>
                expect([
                    { foo: 'bar' },
                    { a: 'something' },
                    { quux: 'xuuq' }
                ]).toContain({ a: 'something', b: 'else' }),
            'to throw',
            trim`
                expected [ { foo: 'bar' }, { a: 'something' }, { quux: 'xuuq' } ]
                to contain { a: 'something', b: 'else' }
            `
        );
    });
});

describe('toEqual()', () => {
    it('should compare strings failing', () => {
        unexpected(
            () => expect('foo').toEqual('bar'),
            'to throw',
            trim`
                expected 'foo' to equal 'bar'

                -foo
                +bar
            `
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

describe('toHaveLength()', () => {
    it('should pass array', () => {
        unexpected(() => expect([1, 2, 3]).toHaveLength(3), 'not to throw');
    });

    it('should pass string', () => {
        unexpected(() => expect('123').toHaveLength(3), 'not to throw');
    });

    it('should fail', () => {
        unexpected(
            () => expect('1234567').toHaveLength(8),
            'to throw',
            trim`
                expected '1234567' to have length 8
                  expected 7 to be 8
            `
        );
    });
});

describe('toHaveProperty()', () => {
    it('should pass on property', () => {
        unexpected(
            () =>
                expect({
                    foo: 'bar',
                    baz: null
                }).toHaveProperty('foo'),
            'not to throw'
        );
    });

    it('should pass on deep property', () => {
        unexpected(
            () =>
                expect({
                    foo: {
                        bar: {
                            quux: 'baz',
                            xuuq: 'baz'
                        }
                    }
                }).toHaveProperty('foo.bar'),
            'not to throw'
        );
    });

    it('should fail on deep property 1', () => {
        unexpected(
            () =>
                expect({
                    foo: 1,
                    baz: {
                        baz: null
                    }
                }).toHaveProperty('foo.bar'),
            'to throw',
            trim`
                expected { foo: 1, baz: { baz: null } } to have property 'foo.bar'

                {
                  foo: 1, // should equal { bar: expect.it('to be defined') }
                  baz: { baz: null }
                }
            `
        );
    });

    it('should fail on deep property 2', () => {
        unexpected(
            () =>
                expect({
                    foo: 1,
                    baz: {
                        baz: null
                    }
                }).toHaveProperty('bar.baz'),
            'to throw',
            trim`
                expected { foo: 1, baz: { baz: null } } to have property 'bar.baz'

                {
                  foo: 1,
                  baz: { baz: null }
                  // missing bar: { baz: expect.it('to be defined') }
                }
            `
        );
    });

    it('should fail on value', () => {
        unexpected(
            () =>
                expect({
                    foo: 1,
                    bar: {
                        baz: null
                    }
                }).toHaveProperty('bar.baz', {
                    a: 1
                }),
            'to throw',
            trim`
                expected { foo: 1, bar: { baz: null } } to have property 'bar.baz'

                {
                  foo: 1,
                  bar: {
                    baz: null // should equal { a: 1 }
                  }
                }
            `
        );
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
                    trim`
                        expected 'foo' to contain 'bar'

                        foo
                    `
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

describe('toMatchObject()', () => {
    it('should pass', () => {
        return unexpected(() => {
            expect({
                a: 'foo',
                b: 'bar',
                c: 'baz'
            }).toMatchObject({
                a: 'foo',
                b: 'bar'
            });
        }, 'not to error');
    });

    it('should fail', () => {
        return unexpected(
            () => {
                expect({
                    a: 'foo',
                    b: 'baz'
                }).toMatchObject({
                    a: 'foo',
                    b: 'bar'
                });
            },
            'to error',
            trim`
                expected { a: 'foo', b: 'baz' } to satisfy { a: 'foo', b: 'bar' }

                {
                  a: 'foo',
                  b: 'baz' // should equal 'bar'
                           //
                           // -baz
                           // +bar
                }
            `
        );
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
            trim`
                expected () => {} to throw
                  did not throw
            `
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
            trim`
                expected () => { throw new Error('baz'); } to throw 'ba'
                  expected Error('baz') to satisfy 'ba'

                  -baz
                  +ba
            `
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
            trim`
                expected () => { throw new Error('baz'); } to throw /bar/
                  expected Error('baz') to satisfy /bar/
            `
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
            trim`
                expected () => { throw new Error('baz'); } to throw Error('bar')
                  expected Error('baz') to satisfy Error('bar')

                  Error({
                    message: 'baz' // should equal 'bar'
                                   //
                                   // -baz
                                   // +bar
                  })
            `
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

describe('expect.any', () => {
    it('should pass on Array', () => {
        unexpected(() => expect([]).toEqual(expect.any(Array)), 'not to throw');
    });

    it('should pass on Function', () => {
        unexpected(
            () => expect(() => {}).toEqual(expect.any(Function)),
            'not to throw'
        );
    });

    it('should pass on Number', () => {
        unexpected(() => expect(1).toEqual(expect.any(Number)), 'not to throw');
    });

    it('should pass on String', () => {
        unexpected(
            () => expect('').toEqual(expect.any(String)),
            'not to throw'
        );
    });

    it('should fail on Array', () => {
        unexpected(
            () => expect({}).toEqual(expect.any(Array)),
            'to throw',
            'expected {} to be an array'
        );
    });

    it('should pass on Function', () => {
        unexpected(
            () => expect({}).toEqual(expect.any(Function)),
            'to throw',
            'expected {} to be a function'
        );
    });

    it('should fail on Number', () => {
        unexpected(
            () => expect({}).toEqual(expect.any(Number)),
            'to throw',
            'expected {} to be a number'
        );
    });

    it('should fail on String', () => {
        unexpected(
            () => expect({}).toEqual(expect.any(String)),
            'to throw',
            'expected {} to be a string'
        );
    });

    describe('within toMatchObject()', () => {
        it('should pass', () => {
            unexpected(
                () =>
                    expect({
                        foo: 1,
                        bar: null
                    }).toMatchObject({
                        foo: expect.any(Number)
                    }),
                'not to throw'
            );
        });

        it('should fail', () => {
            unexpected(
                () =>
                    expect({
                        foo: 1,
                        bar: null
                    }).toMatchObject({
                        foo: expect.any(String)
                    }),
                'to throw',
                trim`
                    expected { foo: 1, bar: null } to satisfy { foo: expect.it('to be a string') }

                    {
                      foo: 1, // should be a string
                      bar: null
                    }
                `
            );
        });
    });
});

describe('expect.arrayContaining', () => {
    it('should pass', () => {
        unexpected(
            () =>
                expect(['foo', 'bar', 'baz']).toEqual(
                    expect.arrayContaining(['bar', 'baz'])
                ),
            'not to throw'
        );
    });

    it('should fail', () => {
        unexpected(
            () =>
                expect(['foo', 'bar']).toEqual(
                    expect.arrayContaining(['barbar'])
                ),
            'to error',
            trim`
                expected [ 'foo', 'bar' ] to equal ArrayContainingSpec([ 'barbar' ])

                [
                  // missing 'barbar'
                ]
            `
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
            trim`
                expected { foo: 'barbar', baz: 'qux' }
                to equal ObjectContainingSpec({ foo: 'bar' })

                {
                  foo: 'barbar', // should equal 'bar'
                                 //
                                 // -barbar
                                 // +bar
                  baz: 'qux'
                }
            `
        );
    });
});

describe('expect.stringContaining', () => {
    it('should pass', () => {
        unexpected(
            () => expect('foobarbaz').toEqual(expect.stringContaining('bar')),
            'not to throw'
        );
    });

    it('should fail', () => {
        unexpected(
            () => expect('foobarbar').toEqual(expect.stringContaining('baz')),
            'to error',
            trim`
                expected 'foobarbar' to equal StringContainingSpec('baz')

                foobarbar
                   ^^ ^^
            `
        );
    });
});

describe('expect.stringMatching', () => {
    it('should pass', () => {
        unexpected(
            () => expect('foobarbaz').toEqual(expect.stringMatching(/bar/)),
            'not to throw'
        );
    });

    it('should fail', () => {
        unexpected(
            () => expect('foobarbar').toEqual(expect.stringMatching(/baz/)),
            'to error',
            "expected 'foobarbar' to equal StringMatchingSpec(/baz/)"
        );
    });

    describe('within expect.arrayContaining', () => {
        it('should pass', () => {
            unexpected(
                () =>
                    expect(['foobar', 'foobaz']).toEqual(
                        expect.arrayContaining([
                            expect.stringMatching(/bar/),
                            expect.stringMatching(/baz/)
                        ])
                    ),
                'not to throw'
            );
        });

        it('should fail', () => {
            unexpected(
                () =>
                    expect(['foobaz', 'foobaz']).toEqual(
                        expect.arrayContaining([
                            expect.stringMatching(/bar/),
                            expect.stringMatching(/baz/)
                        ])
                    ),
                'to throw',
                trim`
                    expected [ 'foobaz', 'foobaz' ]
                    to equal ArrayContainingSpec([ StringMatchingSpec(/bar/), StringMatchingSpec(/baz/) ])

                    [
                      'foobaz', // should match /bar/
                      'foobaz'
                    ]
                `
            );
        });
    });

    describe('within expect.objectContaining', () => {
        it('should pass', () => {
            unexpected(
                () =>
                    expect({
                        a: 'foobar',
                        b: 'foobaz'
                    }).toEqual(
                        expect.objectContaining({
                            a: expect.stringMatching(/bar/),
                            b: expect.stringMatching(/baz/)
                        })
                    ),
                'not to throw'
            );
        });

        it('should fail', () => {
            unexpected(
                () =>
                    expect({
                        a: 'foobaz',
                        b: 'foobaz'
                    }).toEqual(
                        expect.objectContaining({
                            a: expect.stringMatching(/bar/),
                            b: expect.stringMatching(/baz/)
                        })
                    ),
                'to throw',
                trim`
                    expected { a: 'foobaz', b: 'foobaz' }
                    to equal ObjectContainingSpec({ a: StringMatchingSpec(/bar/), b: StringMatchingSpec(/baz/) })

                    {
                      a: 'foobaz', // should match /bar/
                      b: 'foobaz'
                    }
                `
            );
        });
    });
});

describe('with deeply nested containing declarations', () => {
    it('should pass', () => {
        unexpected(
            () =>
                expect({
                    foo: ['foobar', 'foobaz'],
                    b: 'foobaz'
                }).toMatchObject(
                    expect.objectContaining({
                        foo: expect.arrayContaining([
                            expect.stringMatching(/bar/),
                            expect.any(String)
                        ])
                    })
                ),
            'not to throw'
        );
    });

    it('should fail', () => {
        unexpected(
            () =>
                expect({
                    foo: ['foobaz', 'foobaz'],
                    b: 'foobaz'
                }).toMatchObject(
                    expect.objectContaining({
                        foo: expect.arrayContaining([
                            expect.stringMatching(/bar/),
                            expect.any(String)
                        ])
                    })
                ),
            'to throw',
            trim`
                expected { foo: [ 'foobaz', 'foobaz' ], b: 'foobaz' }
                to satisfy { foo: [ /bar/, expect.it('to be a string') ] }

                {
                  foo: [
                    'foobaz', // should match /bar/
                    'foobaz'
                  ],
                  b: 'foobaz'
                }
            `
        );
    });
});
