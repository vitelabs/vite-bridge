const path = require('path')
const resolve = require('rollup-plugin-node-resolve')
const ts = require('rollup-plugin-typescript2')
const pkg = require('../package.json')

const DEV = process.env.NODE_ENV === 'development'

const NAME = 'ViteBridge'
const output_dev = {
	file: path.resolve(__dirname, '../test/bridge.js'),
	format: 'umd',
	name: NAME,
}

const outputs = [{
		file: path.resolve(__dirname, '..', pkg.main),
		format: 'umd',
		name: NAME,
	},
	{
		file: path.resolve(__dirname, '..', pkg.module),
		format: 'es'
	}
]

const extensions = ['.ts']

const getInputOptions = () => ({
	input: path.resolve(__dirname, '../src/index.ts'),
	plugins: [
		resolve({
			extensions,
			preferBuiltins: true
		}),
		ts({
			tsconfig: path.resolve(__dirname, '../tsconfig.json'),
			tsconfigOverride: {
				compilerOptions: {
					declaration: !DEV,
				}
			}
		})
	],
})

module.exports = DEV ? {
	inputOptions: getInputOptions(),
	outputOptions: output_dev
} : {
	inputOptions: getInputOptions(),
	outputOptions: outputs,
}