// TODO 引入stylelint来规范css代码!
//	'*.{css,scss,less}': 'stylelint  & prettier --write',
module.exports = {
	'*.{js,ts,jsx,tsx}': 'eslint',

	'*.{css,scss,less}': 'prettier --write',
	// '*.{json,md,yaml,html,sql}': 'prettier --write',
	'*.{sh,bash}': 'shfmt -w'
};
