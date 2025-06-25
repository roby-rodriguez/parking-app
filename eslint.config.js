import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
	{ ignores: ['dist', 'supabase'] },
	// TypeScript config
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
			globals: globals.browser,
		},
		plugins: {
			'@typescript-eslint': tseslint,
		},
		rules: {
			...tseslint.configs.recommended.rules,
		},
	},
	// JS/React config
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: 'latest',
				ecmaFeatures: { jsx: true },
				sourceType: 'module',
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			'import': importPlugin,
			'react': reactPlugin,
		},
		rules: {
			...js.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
			'indent': ['error', 'tab', { 
				'SwitchCase': 1,
				'VariableDeclarator': 1,
				'outerIIFEBody': 1,
				'MemberExpression': 1,
				'FunctionDeclaration': { 'parameters': 1, 'body': 1 },
				'FunctionExpression': { 'parameters': 1, 'body': 1 },
				'CallExpression': { 'arguments': 1 },
				'ArrayExpression': 1,
				'ObjectExpression': 1,
				'ImportDeclaration': 1,
				'flatTernaryExpressions': false,
				'ignoreComments': false,
				'ignoredNodes': [
					'JSXElement',
					'JSXElement > *',
					'JSXAttribute',
					'JSXIdentifier',
					'JSXNamespacedName',
					'JSXMemberExpression',
					'JSXSpreadAttribute',
					'JSXExpressionContainer',
					'JSXOpeningElement',
					'JSXClosingElement',
					'JSXFragment',
					'JSXOpeningFragment',
					'JSXClosingFragment',
					'JSXText',
					'JSXEmptyExpression',
					'JSXSpreadChild'
				]
			}],
			'no-tabs': 'off',
			'semi': ['error', 'always'],
			'comma-dangle': ['error', 'always-multiline'],
			'quotes': ['error', 'single'],
			'object-curly-spacing': ['error', 'always'],
			'array-bracket-spacing': ['error', 'never'],
			'comma-spacing': ['error', { before: false, after: true }],
			'key-spacing': ['error', { beforeColon: false, afterColon: true }],
			'keyword-spacing': ['error', { before: true, after: true }],
			'space-before-blocks': ['error', 'always'],
			'space-before-function-paren': [
				'error',
				{
					anonymous: 'always',
					named: 'never',
					asyncArrow: 'always',
				},
			],
			'space-in-parens': ['error', 'never'],
			'space-infix-ops': 'error',
			'arrow-spacing': ['error', { before: true, after: true }],
			// Switch statement rules
			'switch-colon-spacing': ['error', { after: true, before: false }],
			'no-fallthrough': 'error',
			'no-case-declarations': 'error',
			// Additional formatting rules
			'brace-style': ['error', '1tbs', { allowSingleLine: true }],
			'curly': ['error', 'all'],
			'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
			'eol-last': 'error',
			'no-trailing-spaces': 'error',
			'import/no-duplicates': 'error',
			'import/order': [
				'error',
				{
					'groups': [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					'alphabetize': {
						'order': 'asc',
						'caseInsensitive': true,
					},
				},
			],
			'react/jsx-curly-spacing': ['error', 'never'],
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
		},
	},
];
