const madge = require('madge');
const path = require('path');
const fs = require('fs');
const [
	entryFile = path.join(process.cwd(), '../packages/backend/src/main.ts'),
	writtenImagePath = path.join(process.cwd(), './dependency-graph.svg')
] = process.argv.slice(2);
console.log('entryFile redead:', entryFile);
try {
	fs.unlinkSync(writtenImagePath, err => {
		if (err) {
			console.log(err);
		}
	});
} catch (error) {}

madge(entryFile, {
	// excludeRegExp: ['.*\.(dto|d|controller|service|gateway)\.ts$', 'utils.ts', 'decorator.ts']
})
	.then(res => res.image(writtenImagePath))
	.then(writtenPath => {
		console.log('Image written to ' + writtenPath);
	});
