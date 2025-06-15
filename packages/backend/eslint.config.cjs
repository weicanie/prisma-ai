const eslint = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
	{
		ignores: ['eslint.config.mjs']
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest
			},
			sourceType: 'commonjs',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname
			}
		}
	},
	//TODO 代码规范治理
	//pnpm exec lint-staged --concurrent 3
	{
		rules: {
			//待治理项
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/require-await': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-floating-promises': 'off',
			'@typescript-eslint/no-redundant-type-constituents': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			//等
			//合理项
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/interface-name-prefix': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off'
			// '@typescript-eslint/no-unused-vars': [
			//   'warn',
			//   { 'argsIgnorePattern': '^_' }
			// ],
		}
	}
);
