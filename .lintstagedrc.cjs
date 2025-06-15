module.exports = {
	'*.{js,ts,jsx,tsx}': ['pnpm exec eslint', 'pnpm exec prettier --check'],
	'*.{css,scss,less}': 'pnpm exec prettier --check'
};
