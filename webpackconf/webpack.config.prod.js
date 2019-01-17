const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: "./src/index.js",
    mode: "production",
    output: {
        library: 'bridge',
        libraryTarget: 'umd'
    }
}