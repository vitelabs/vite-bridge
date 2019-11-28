const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: "./sendTx/index.js",
  output: {
    publicPath: "/", //这里要放的是静态资源CDN的地址
    path: path.resolve(__dirname, "./dist"),
    filename: "index.js" // 单文件输出 ，如果多文件可在 entry :{} ,这里 filename: '[name].js'
  },
  resolve: {
    extensions: [".js", ".css", ".json"],
    alias: {
      // jquery: './src/units/jquery-1.83.min.js',
    } //配置别名可以加快webpack查找模块的速度
  },
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/ }]
    // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "sendTx/index.html"
    })
  ],
  devtool: "eval-source-map", // 指定加source-map的方式
  devServer: {
    contentBase: path.join(__dirname, "dist"), //静态文件根目录
    port: 3824, // 端口
    host: "0.0.0.0",
    overlay: true,
    compress: false // 服务器返回浏览器的时候是否启动gzip压缩
  }
};