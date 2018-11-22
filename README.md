# karma-sonarqube-execution-reporter

[![NpmLicense](https://img.shields.io/npm/l/karma-sonarqube-execution-reporter.svg)](https://opensource.org/licenses/MIT) [![npm](https://img.shields.io/npm/dt/karma-sonarqube-execution-reporter.svg)](https://npmjs.com/package/karma-sonarqube-execution-reporter) [![NpmVersion](https://img.shields.io/npm/v/karma-sonarqube-execution-reporter.svg)](https://npmjs.com/package/karma-sonarqube-execution-reporter)


## Motivation

This solution is based on https://github.com/tornaia/karma-sonarqube-unit-reporter

Issue: karma-sonarqube-unit-reporter has problem with putting correct `path` attribute in `file` tag.

## How to get

Just run `npm install --save-dev karma-sonarqube-unit-reporter` in your project directory.

Package is also available on npmjs.org
https://www.npmjs.com/package/https://github.com/lisrec/karma-sonarqube-execution-reporter

## How to use

1. Import plugin to karma.conf.js in `plugins` section:

```js
module.exports = function (config) {
  config.set({
    plugins: [
      require('karma-sonarqube-execution-reporter')
    ]
  })
}
```

2. Add basic configuration to karma.conf.js in `config.set` section:

```js
module.exports = function (config) {
  config.set({
    sonarQubeExecutionReporter: {
      sonarQubeVersion: 'LATEST',
      testPaths: ['./src/app'],
      testFilePattern: '.spec.ts',
      outputDir: './coverage',
      outputFile: 'ut_report.xml'
    },
  })
}
```

## Avaible options - descriptions [TODO]
### sonarQubeVersion
### suite
### outputFile
### outputDir
### useBrowserName
### testPath
### testPaths
### testFilePattern
