module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:fp-ts/recommended",
		"plugin:fp-ts/recommended-requiring-type-checking",
		"plugin:@typescript-eslint/recommended",
		"prettier"
	],
	plugins: ["fp-ts", "@typescript-eslint"],
	ignorePatterns: ["*.js"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"]
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
}
