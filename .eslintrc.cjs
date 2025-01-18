require('@knicola/dev-config/eslint/patch')

module.exports = {
    extends: ['./node_modules/@knicola/dev-config/eslint/node'],
    parserOptions: { tsconfigRootDir: __dirname },
    settings: {
        'import/resolver': {
            typescript: { project: __dirname },
        },
    },
    rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/method-signature-style': 'off',
        '@typescript-eslint/prefer-function-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'explicit',
                overrides: {
                    accessors: 'off',
                    constructors: 'no-public',
                    methods: 'explicit',
                    properties: 'explicit',
                    parameterProperties: 'explicit',
                },
            },
        ],
        curly: 'off',
    },
    overrides: [
        {
            files: '*.tsx',
            rules: {
                'promise-function-async': 'off',
                '@typescript-eslint/promise-function-async': 'off',
            },
        },
    ],
}
