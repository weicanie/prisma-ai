const eslint = require('@eslint/js');
// const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
	{
		ignores: ['eslint.config.mjs']
	},
	eslint.configs.recommended,
	//TODO 代码规范治理
	//pnpm exec lint-staged --concurrent 3
	// ...tseslint.configs.recommendedTypeChecked,
	// eslintPluginPrettierRecommended,
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
	{
		rules: {
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
