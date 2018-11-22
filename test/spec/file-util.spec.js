/* eslint-disable no-undef */

describe('create description - file name map from test sources', () => {

	let fileUtil;
	beforeEach(() => fileUtil = require('../../src/file-util.js'));

	it('one test file, one description', () => {
		const filesForDescriptions = fileUtil.getFilesForDescriptions(['test/resources/one_file_one_description'], '.spec.js');
		const expectedPath = 'test/resources/one_file_one_description/test.spec.js';
		const expected = {'test description': expectedPath};
		expect(filesForDescriptions).toEqual(expected);
	});

	it('multiple test files, one description', () => {
		const filesForDescriptions = fileUtil.getFilesForDescriptions(['test/resources/multiple_files_one_description'], '.spec.js');
		const firstExpectedPath = 'test/resources/multiple_files_one_description/first_test.spec.js';
		const secondExpectedPath = 'test/resources/multiple_files_one_description/second_test.spec.js';
		const expected = {'first test description': firstExpectedPath, 'second test description': secondExpectedPath};
		expect(filesForDescriptions).toEqual(expected);
	});

	it('one test file, multiple descriptions', () => {
		const filesForDescriptions = fileUtil.getFilesForDescriptions(['test/resources/one_file_multiple_descriptions'], '.spec.js');
		const expectedPath = 'test/resources/one_file_multiple_descriptions/test.spec.js';
		const expected = {'test description': expectedPath, 'another test description': expectedPath};
		expect(filesForDescriptions).toEqual(expected);
	});

	it('mutliple test files, multiple descriptions', () => {
		const filesForDescriptions = fileUtil.getFilesForDescriptions(['test/resources/multiple_files_multiple_descriptions'], '.spec.js');
		const firstExpectedPath = 'test/resources/multiple_files_multiple_descriptions/first_test.spec.js';
		const secondExpectedPath = 'test/resources/multiple_files_multiple_descriptions/second_test.spec.js';
		const expected = {
			'first test first description': firstExpectedPath,
			'first test second description': firstExpectedPath,
			'second test first description': secondExpectedPath,
			'second test second description': secondExpectedPath
		};
		expect(filesForDescriptions).toEqual(expected);
	});

	it('two folders, two test files', () => {
		const filesForDescriptions = fileUtil.getFilesForDescriptions([
			'test/resources/one_file_one_description',
			'test/resources/multiple_files_one_description'
		], '.spec.js');
		const firstExpectedPath = 'test/resources/one_file_one_description/test.spec.js';
		const secondExpectedPath = 'test/resources/multiple_files_one_description/first_test.spec.js';
		const thirdExpectedPath = 'test/resources/multiple_files_one_description/second_test.spec.js';
		const expected = {
			'test description': firstExpectedPath,
			'first test description': secondExpectedPath,
			'second test description': thirdExpectedPath
		};
		expect(filesForDescriptions).toEqual(expected);
	});
});
