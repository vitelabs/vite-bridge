const http = require('http')
const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const config = require('./rollup.config')

const DIST = path.resolve(__dirname, '../test')

const build = () => rollup.rollup(config.inputOptions).then(bundle => bundle.write(config.outputOptions))

const roll = () => {
    const next = () => setTimeout(roll, 1000)
    build().then(next, next)
}
roll()

http.createServer((req, res) => {
    const url = req.url
    const slash = url.lastIndexOf('/')
    const query = url.indexOf('?')
    let filename = ''
    if (query > -1) {
        filename = url.slice(slash + 1, query)
    } else {
        filename = url.slice(slash + 1)
    }

    if (filename === 'favicon.ico') {
        res.statusCode = 404
        res.end()
        return
    }

    if (!filename) {
        filename = 'index.html'
    }

    filename = path.resolve(DIST, filename)
    const rs = fs.createReadStream(filename)
    rs.pipe(res)
    rs.on('end', () => res.end())
    rs.on('error', () => res.end())
}).listen(3824, '0.0.0.0', () => {
    console.log('server is listener at http://localhost:3824')
})
