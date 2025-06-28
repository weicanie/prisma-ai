const fs = require('fs');
const path = require('path');

const [
	entryFile = path.join(process.cwd(), '../packages/backend/src/main.ts'),
	writtenImagePath = path.join(process.cwd(), './dependency-graph.svg')
] = process.argv.slice(2);

console.log('entryFile read:', entryFile);

try {
	fs.unlinkSync(writtenImagePath);
	console.log('Removed existing dependency graph file.');
} catch (error) {
	if (error.code !== 'ENOENT') {
		console.log(error);
	} else {
		console.log('No existing dependency graph file found.');
	}
}

// Use a dynamic import for the ESM-only package 'madge'
(async () => {
	try {
		const { default: madge } = await import('madge');
		const res = await madge(entryFile, {
			//只绘制service,controller,module,gateway间的依赖关系
			excludeRegExp: ['^(?!.*\\.(service|controller|module|gateway)\\.ts$).*\\.ts$']
		});
		const writtenPath = await res.image(writtenImagePath);
		console.log('Image written to ' + writtenPath);
	} catch (error) {
		console.error('Error during dependency graph generation:', error);
	}
})();
