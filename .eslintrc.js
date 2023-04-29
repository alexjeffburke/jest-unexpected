const config = {
    extends: ['standard', 'prettier'],
    plugins: ['import', 'mocha', 'promise'],
    overrides: [
        {
            files: ['*.spec.js'],
            env: {
                mocha: true,
            },
            rules: {
                'no-new': 'off',
                'mocha/no-exclusive-tests': 'error',
                'mocha/no-nested-tests': 'error',
                'mocha/no-identical-title': 'error',
            },
        },
    ],
};

module.exports = config;
