// eslint.config.js (ESM)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
    {
        ignores: ['dist/**', 'node_modules/**'],
    },

    // JS/TS rules (flat config)
    ...tseslint.config({
        files: ['**/*.{ts,tsx,js}'],
        languageOptions: {
            parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        },
        plugins: {
            import: await import('eslint-plugin-import'),
            // (prettier plugin is optional if you only want formatting on save via Prettier)
            prettier: (await import('eslint-plugin-prettier')).default,
        },
        settings: {
            'import/resolver': { typescript: true, node: true },
        },
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended, // TS recommended
            prettier, // turn off style rules that fight Prettier
        ],
        rules: {
            // node/backend niceties
            'no-console': 'off',
            'no-extra-semi': 'error',

            // import hygiene
            'import/order': 'off',
            'prettier/prettier': ['warn'], // surface Prettier diffs as ESLint warnings
        },
    }),
];
