const path = require('path');
const fs = require('fs');


const findDescribeInText = function(textToSearch) {
	const keyWords = [
		'describe(',
		'describe (',
		'describe.only(',
		'describe.only (',
	];

	for(const idx in keyWords) {

		const pos = textToSearch.indexOf(keyWords[idx]);

		if (pos !== -1) {
			return {
				position: pos,
				length: keyWords[idx].length
			};
		}
	}

	return {
		position: -1,
		length: 0
	};
};

const findFilesInDir = function(startPath, filter) {

	if (!fs.existsSync(startPath)) {
		// eslint-disable-next-line no-console
		console.warn('Source directory not found. ', startPath);
		return;
	}

	let results = [];
	const files = fs.readdirSync(startPath);
	const filterRegex = new RegExp(filter);

	for (let i = 0; i < files.length; i++) {
		const filename = path.join(startPath, files[i]);
		const stat = fs.lstatSync(filename);

		if (stat.isDirectory() && filename !== 'node_modules') {
			results = results.concat(findFilesInDir(filename, filter));
		} else if (filterRegex.test(filename)) {
			results.push(filename);
		}
	}

	return results;
};

const findDescriptionInFile = (respArray) => (item, _index) => {
	try {
		let fileText = fs.readFileSync(item, 'utf8');
		let position = 0;

		while (position !== -1) {
			let describe;
			const findDescribe = findDescribeInText(fileText);
			position = findDescribe.position;

			if (position !== -1) {
				const startDescribePosition = position + findDescribe.length;

				const delimeter = fileText[startDescribePosition];
				const descriptionEnd = fileText.indexOf(delimeter, startDescribePosition + 1) + 1;

				describe = fileText.substring(startDescribePosition + 1, descriptionEnd - 1);
				describe = describe.replace(/\\\\/g, '/');

				item = item.replace(/\\\\/g, '/').replace(/\\/g, '/');

				fileText = fileText.substring(descriptionEnd);
				respArray[describe] = item;
				position = 0;
			}
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Error:', e.stack);
	}
};

const getFilesForDescriptions = function(startPaths, filter) {
	const ret = {};

	startPaths.forEach((startPathItem) => {
		const files = findFilesInDir(startPathItem, filter);
		files.forEach(findDescriptionInFile(ret));
	});

	return ret;
};


module.exports = { getFilesForDescriptions };
