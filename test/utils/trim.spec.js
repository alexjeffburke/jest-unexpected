const expect = require('unexpected');
const trim = require('./trim');

it('should not trim good output', () => {
    const bar = 'bar';
    expect(trim`foo ${bar} baz`, 'to equal', 'foo bar baz');
});

it('should trim output', () => {
    expect(
        trim`
            foo
        `,
        'to equal',
        'foo'
    );
});

it('should trim output and preserve nested spacing', () => {
    expect(
        trim`
            foo
            bar
                baz
        `,
        'to equal',
        ['foo', 'bar', '    baz'].join('\n')
    );
});
