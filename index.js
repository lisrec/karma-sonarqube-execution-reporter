const path = require('path');
const fs = require('fs');
const builder = require('xmlbuilder');
const fileUtil = require('./src/file-util.js');

const SonarQubeUnitReporter = function (baseReporterDecorator, config, logger, helper, formatError) {
	const log = logger.create('reporter.sonarqubeUnit');
	const reporterConfig = config.sonarQubeUnitReporter || {};
	const sonarQubeVersion = reporterConfig.sonarQubeVersion || 'LATEST';
	const pkgName = reporterConfig.suite || '';
	const outputFile = reporterConfig.outputFile;

	let outputDir = reporterConfig.outputDir;
	let useBrowserName = reporterConfig.useBrowserName;

	let filenameFormatter = reporterConfig.filenameFormatter || null;
	const testnameFormatter = reporterConfig.testnameFormatter || null;

	let suites;
	let pendingFileWritings = 0;
	let fileWritingFinished = function () {};
	const allMessages = [];

	if (outputDir == null) {
		outputDir = '.';
	}

	outputDir = helper.normalizeWinPath(path.resolve(config.basePath, outputDir)) + path.sep;

	if (typeof useBrowserName === 'undefined') {
		useBrowserName = true;
	}

	baseReporterDecorator(this);

	this.adapters = [
		function (msg) {
			allMessages.push(msg);
		}
	];

	const initliazeXmlForBrowser = function (browser) {
		let tagName;
		switch (sonarQubeVersion) {
		case '5.x':
			tagName = 'unitTest'; break;
		default:
			tagName = 'testExecutions';
		}

		const parentTag = suites[browser.id] = builder.create(tagName,
			{version: '1.0', encoding: 'UTF-8', standalone: true},
			{pubID: null, sysID: null},
			{allowSurrogateChars: false, skipNullAttributes: false, headless: true, ignoreDecorators: false, separateArrayItems: false, noDoubleEncoding: false, stringify: {}});

		parentTag.att('version', '1');
	};

	const writeXmlForBrowser = function (browser) {
		const safeBrowserName = browser.name.replace(/ /g, '_');
		let newOutputFile;
		if (outputFile != null) {
			const dir = useBrowserName ? path.join(outputDir, safeBrowserName) : outputDir;
			newOutputFile = path.join(dir, outputFile);
		} else if (useBrowserName) {
			newOutputFile = path.join(outputDir, 'ut_report-' + safeBrowserName + '.xml');
		} else {
			newOutputFile = path.join(outputDir, 'ut_report.xml');
		}

		const xmlToOutput = suites[browser.id];
		if (!xmlToOutput) {
			return; // don't die if browser didn't start
		}

		pendingFileWritings++;
		helper.mkdirIfNotExists(path.dirname(newOutputFile), () => {
			fs.writeFile(newOutputFile, xmlToOutput.end({pretty: true}), (err) => {
				if (err) {
					log.warn('Cannot write JUnit xml\n\t' + err.message);
				} else {
					log.debug('JUnit results written to "%s".', newOutputFile);
				}

				if (!--pendingFileWritings) {
					fileWritingFinished();
				}
			});
		});
	};

	const getClassName = function (browser, result) {
		const browserName = browser.name.replace(/ /g, '_').replace(/\./g, '_') + '.';

		return (useBrowserName ? browserName : '') + (pkgName ? pkgName + '/' : '') + result.suite[0];
	};

	this.onRunStart = function (browsers) {
		suites = Object.create(null);

		// TODO(vojta): remove once we don't care about Karma 0.10
		browsers.forEach(initliazeXmlForBrowser);
	};

	this.onBrowserStart = function (browser) {
		initliazeXmlForBrowser(browser);
	};

	this.onBrowserComplete = function (browser) {
		const suite = suites[browser.id];
		const result = browser.lastResult;
		if (!suite || !result) {
			return; // don't die if browser didn't start
		}

		writeXmlForBrowser(browser);
	};

	this.onRunComplete = function () {
		suites = null;
		allMessages.length = 0;
	};

	this.specSuccess = this.specSkipped = this.specFailure = function (browser, result) {
		const preMapped = getClassName(browser, result).replace(/\\/g, '/');
		let nextPath = preMapped;
		if (filenameFormatter !== null) {
			nextPath = filenameFormatter(nextPath, result);
			if (preMapped !== nextPath) {
				log.debug('Transformed File name "' + preMapped + '" -> "' + nextPath + '"');
			} else {
				log.debug('Name not transformed for File "' + preMapped + '"');
			}
		}

		const fileNodes = suites[browser.id];
		let lastFilePath;

		const numberOfFileNodes = fileNodes.children.length;
		if (numberOfFileNodes > 0) {
			lastFilePath = fileNodes.children[numberOfFileNodes - 1].attributes.path.value;
			if (lastFilePath !== nextPath) {
				suites[browser.id].ele('file', {
					path: nextPath
				});
			}
		} else {
			suites[browser.id].ele('file', {
				path: nextPath
			});
		}
		lastFilePath = nextPath;

		const appendToThisNode = suites[browser.id].children[suites[browser.id].children.length - 1];

		function getDescription (result) {
			let desc = result.description;
			for (let i = result.suite.length - 1; i >= 0; i--) {
				desc = result.suite[i] + ' ' + desc;
			}
			return desc;
		}

		const testname = getDescription(result);
		let testnameFormatted = testname;

		if (testnameFormatter !== null) {
			testnameFormatted = testnameFormatter(testname, result);
			if (testnameFormatted && testnameFormatted !== testname) {
				log.debug('Transformed test name "' + testname + '" -> "' + testnameFormatted + '"');
			} else {
				testnameFormatted = testname;
				log.debug('Name not transformed for test "' + testnameFormatted + '"');
			}
		}
		const testCase = appendToThisNode.ele('testCase', {name: testnameFormatted, duration: (result.time || 1)});

		if (result.skipped) {
			testCase.ele('skipped', {message: 'Skipped'});
		}

		if (!result.success) {
			testCase.ele('failure', {message: 'Error'}, formatError(result.log.join('\n\n')));
		}
	};

	// wait for writing all the xml files, before exiting
	this.onExit = function (done) {
		if (pendingFileWritings) {
			fileWritingFinished = done;
		} else {
			done();
		}
	};

	// look for jasmine test files in the specified path
	const overrideTestDescription = reporterConfig.overrideTestDescription || false;
	const testPath = reporterConfig.testPath || './';
	const testPaths = reporterConfig.testPaths || [testPath];
	const testFilePattern = reporterConfig.testFilePattern || '(.spec.ts|.spec.js)';
	const filesForDescriptions = fileUtil.getFilesForDescriptions(testPaths, testFilePattern);

	function defaultFilenameFormatter (nextPath, _result) {
		return filesForDescriptions[nextPath];
	}

	if (overrideTestDescription) {
		filenameFormatter = defaultFilenameFormatter;
	}
};

SonarQubeUnitReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
	'reporter:sonarqubeUnit': ['type', SonarQubeUnitReporter]
};
