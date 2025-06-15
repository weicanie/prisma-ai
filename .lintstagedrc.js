export default {
	'*.{js,ts,jsx,tsx}': ['eslint --fix', 'prettier --write'],
	'*.{css,scss,less}': 'prettier --write',
	'*.{json,md,yaml,html,sql}': 'prettier --write',
	'*.{sh,bash}': 'shfmt -w'
};
