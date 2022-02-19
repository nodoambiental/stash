// Karma configuration
// Generated on Mon Feb 14 2022 16:28:20 GMT-0300 (Argentina Standard Time)

process.env.CHROME_BIN = require("puppeteer").executablePath()

module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: "",

		// frameworks to use
		// available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
		frameworks: ["jasmine", "karma-typescript"],

		karmaTypescriptConfig: {
			compilerOptions: {
				module: "commonjs"
			},
			tsconfig: "./tsconfig.json"
		},

		// list of files / patterns to load in the browser
		files: ["src/*.ts", "spec/*.spec.ts"],

		// list of files / patterns to exclude
		exclude: [],

		preprocessors: {
			"**/*.ts": "karma-typescript" // *.tsx for React Jsx
		},
		reporters: ["progress", "karma-typescript"],

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		// autoWatch: true,

		// start these browsers
		// available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
		browsers: ["Firefox", "ChromeHeadless", "ChromeHeadlessCI"],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		//singleRun: tru,

		// Concurrency level
		// how many browser instances should be started simultaneously
		concurrency: Infinity,
		customLaunchers: {
			ChromeHeadlessCI: {
				base: "ChromeHeadless",
				flags: ["--no-sandbox"]
			}
		}
	})
}
