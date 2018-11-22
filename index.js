const path = require('path');
const fs = require('fs');
const builder = require('xmlbuilder');
const fileUtil = require('./src/file-util.js');


const SonarQubeExecutionReporter = function(baseReporterDecorator, config, logger, helper, formatError) {
	const log = logger.create('reporter.sonarqubeUnit');

	// Get configuration
	const repConf = config.sonarQubeExecutionReporter || {};
	const sonarQubeVersion = repConf.sonarQubeVersion || 'LATEST';
	const pkgName = repConf.suite || '';
	const outputFile = repConf.outputFile;
	const outputDir = helper.normalizeWinPath(path.resolve(config.basePath, repConf.outputDir || '.')) + path.sep;
	const useBrowserName = (!repConf.useBrowserName) ? false : true;

	const testPath = repConf.testPath || './';
	const testPaths = repConf.testPaths || [testPath];
	const testFilePattern = repConf.testFilePattern || '.spec.(ts|js)';
	const filesForDescriptions = fileUtil.getFilesForDescriptions(testPaths, testFilePattern);


	// Init data
	let suites;
	let pendingFileWritings = 0;
	let fileWritingFinished = () => null;
	const allMessages = [];

	baseReporterDecorator(this);

	this.adapters = [
		function(msg) {
			allMessages.push(msg);
		}
	];


	// Helpers functions
	const transformDescribeToPath = function(nextPath, _result) {
		return filesForDescriptions[nextPath];
	};

	const initliazeXmlForBrowser = function(browser) {
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

	const writeXmlForBrowser = function(browser) {
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

	const getClassName = function(browser, result) {
		const browserName = browser.name.replace(/ /g, '_').replace(/\./g, '_') + '.';
		return (useBrowserName ? browserName : '') + (pkgName ? pkgName + '/' : '') + result.suite[0];
	};

	const getTestName = function(result) {
		let desc = result.description;
		for (let i = result.suite.length - 1; i >= 0; i--) {
			desc = result.suite[i] + ' ' + desc;
		}
		return desc;
	};


	// Karma methods override
	const karmaOnRunStart = function() {
		suites = Object.create(null);
	};

	const karmaOnBrowserStart = function(browser) {
		initliazeXmlForBrowser(browser);
	};

	const karmaOnBrowserComplete = function(browser) {
		const suite = suites[browser.id];
		const result = browser.lastResult;
		if (!suite || !result) {
			return;
		}

		writeXmlForBrowser(browser);
	};

	const karmaOnRunComplete = function() {
		suites = null;
		allMessages.length = 0;
	};

	const karmaSpecDone = function(browser, result) {
		const specDescribe = getClassName(browser, result).replace(/\\/g, '/');
		const nextPath = transformDescribeToPath(specDescribe, result);
		log.debug('Transformed File name "' + specDescribe + '" -> "' + nextPath + '"');

		let lastFilePath;
		const fileNodes = suites[browser.id];
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
		const testname = getTestName(result);
		const testCase = appendToThisNode.ele('testCase', { name: testname, duration: (result.time || 1) });

		if (result.skipped) {
			testCase.ele('skipped', { message: 'Skipped' });
		}

		if (!result.success) {
			testCase.ele('failure', { message: 'Error' }, formatError(result.log.join('\n\n')));
		}
	};

	const karmaOnExit = function(done) {
		if (pendingFileWritings) {
			fileWritingFinished = done;
		} else {
			done();
		}
	};


	// Bind karma functions
	this.onRunStart = karmaOnRunStart;
	this.onBrowserStart = karmaOnBrowserStart;
	this.onBrowserComplete = karmaOnBrowserComplete;
	this.onRunComplete = karmaOnRunComplete;
	this.specSuccess = karmaSpecDone;
	this.specSkipped = karmaSpecDone;
	this.specFailure = karmaSpecDone;
	this.onExit = karmaOnExit;
};

SonarQubeExecutionReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

module.exports = {
	'reporter:sonarqubeUnit': ['type', SonarQubeExecutionReporter]
};
