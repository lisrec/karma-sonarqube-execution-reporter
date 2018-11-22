const path = require('path');
const fs = require('fs');

module.exports = {
	getFilesForDescriptions: getFilesForDescriptions
};

function getFilesForDescriptions (startPaths, filter) {
	const ret = {};

	startPaths.forEach((startPathItem) => {
		const files = findFilesInDir(startPathItem, filter);
		files.forEach(findDescriptionInFile);
	});

	function findDescriptionInFile (item, _index) {
		try {
			let fileText = fs.readFileSync(item, 'utf8');
			let position = 0;
			while (position !== -1) {
				let describe;
				position = fileText.indexOf('describe(');
				if (position !== -1) {
					const delimeter = fileText[position + 9];
					const descriptionEnd = fileText.indexOf(delimeter, position + 10) + 1;
					describe = fileText.substring(position + 10, descriptionEnd - 1);
					describe = describe.replace(/\\\\/g, '/');
					item = item.replace(/\\\\/g, '/').replace(/\\/g, '/');
					ret[describe] = item;
					position = 0;
					fileText = fileText.substring(descriptionEnd);
				}
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Error:', e.stack);
		}
	}

	return ret;
}

function findFilesInDir (startPath, filter) {
	let results = [];

	if (!fs.existsSync(startPath)) {
		// eslint-disable-next-line no-console
		console.warn('Source directory not found. ', startPath);
		return;
	}

	const files = fs.readdirSync(startPath);
	for (let i = 0; i < files.length; i++) {
		const filename = path.join(startPath, files[i]);
		const stat = fs.lstatSync(filename);
		if (stat.isDirectory()) {
			if (filename !== 'node_modules') {
				results = results.concat(findFilesInDir(filename, filter));
			}
		} else if (filename.endsWith(filter)) {
			results.push(filename);
		}
	}
	return results;
}
