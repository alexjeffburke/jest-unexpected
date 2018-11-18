const expect = require('unexpected');
const truncate = require('./truncate');

it('should truncate trace output', () => {
    expect(
        truncate(
            [
                'expected callback was called times 2',
                '    expected',
                '    callback(); at Object.it (Users/alex/Documents/projects/jest-unexpected/test/jestUnexpected.spec.js:111:22)',
                '    to have length 2',
                '    expected 1 to be 2'
            ].join('\n')
        ),
        'to equal',
        [
            'expected callback was called times 2',
            '    expected',
            '    callback(); at Object.it (<path>:*:*)',
            '    to have length 2',
            '    expected 1 to be 2'
        ].join('\n')
    );
});

it('should truncate trace output for node 4', () => {
    const isTranspiled = true;

    expect(
        truncate(
            [
                'expected callback was called times 2',
                '    expected',
                '    callback(); at Users/alex/Documents/projects/jest-unexpected/test/jestUnexpected.spec.js:111:22',
                '    to have length 2',
                '    expected 1 to be 2'
            ].join('\n'),
            isTranspiled
        ),
        'to equal',
        [
            'expected callback was called times 2',
            '    expected',
            '    callback(); at (<path>:*:*)',
            '    to have length 2',
            '    expected 1 to be 2'
        ].join('\n')
    );
});
