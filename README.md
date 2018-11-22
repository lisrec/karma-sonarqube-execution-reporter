# karma-sonarqube-execution-reporter

[![NpmLicense](https://img.shields.io/npm/l/karma-sonarqube-execution-reporter.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/dt/karma-sonarqube-execution-reporter.svg)](https://npmjs.com/package/karma-sonarqube-execution-reporter)
[![NpmVersion](https://img.shields.io/npm/v/karma-sonarqube-execution-reporter.svg)](https://npmjs.com/package/karma-sonarqube-execution-reporter)

## How to install

Run `npm install --save-dev karma-sonarqube-unit-reporter` in your project directory. <br>
Package is also available on [npmjs.org](https://www.npmjs.com/package/karma-sonarqube-execution-reporter)

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

2. Add plugin configuration to karma.conf.js in `config.set` section:

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

## Avaible options - descriptions
```ts
sonarQubeExecutionReporter: {
  sonarQubeVersion: string,
  outputFile: string,
  outputDir: string,
  useBrowserName: boolean,
  testPaths: string[],
  testFilePattern: string,
}
```

### sonarQubeVersion

Pass `'LATEST'` or main version of your SonarQube (pattern: `'5.x'`, `'6.x'`, etc). <br>
Default value: `'LATEST'`

### outputFile

File name for xml report (for example `'execution-report.xml'`). <br>
Default value: `'ut_report.xml'`

### outputDir

Relative directory for saving report file. If the directory doesn't exist will be created. <br>
Default value: `'./'` (current directory)

### testPath

A single path to the directory, that will be recursively scanned to find tests files. <br>
Default value: `'./'` (current directory)

### testPaths

You can pass multiple relative directories instead of a single path, all directories will be recursively scanned for tests files. (Overrides option `testPath`!) <br>
Default value: `['./']` (current directory only)

### testFilePattern

You can pass a regex that will match your test files (for example `'(.spec.js)|(.test.js)'`). <br>
Default value: `.spec.(ts|js)`
