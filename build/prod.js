const path = require('path')
const fs = require('fs')
const rollup = require('rollup')
const config = require('./rollup.config')

const bundlePro = rollup.rollup(config.inputOptions)
const pros = config.outputOptions.map(output => {
    return bundlePro.then(bundle => bundle.write(output))
})

Promise.all(pros).then(() => {
    const bridge = path.resolve(__dirname, '../dist/bridge.js')
    const target = path.resolve(__dirname, '../test/bridge.js')
    fs.copyFileSync(bridge, target)
})
