const path=require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    entry: "./src/test.js",
    output: {
        publicPath: '/', //这里要放的是静态资源CDN的地址
        path: path.resolve(__dirname, 'dist'),
        filename: 'build.js' // 单文件输出 ，如果多文件可在 entry :{} ,这里 filename: '[name].js'
    },
    resolve: {
        extensions: [".js", ".css", ".json"],
        alias: {
            // jquery: './src/units/jquery-1.83.min.js',
        } //配置别名可以加快webpack查找模块的速度
    },
    module: {
        // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
    },
    mode:process.NODE_ENV==="production"?"production":"development",
    plugins: [
        new HtmlWebpackPlugin({
            template:"./src/index.html"
        }),
        // 多入口的html文件用chunks这个参数来区分
        /* new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src', 'index.html'),
        filename: 'index.html',
        hash: true,//防止缓存
        minify: {
        removeAttributeQuotes: true//压缩 去掉引号
        }
        }),*/
    ],
    devtool: 'eval-source-map', // 指定加source-map的方式
    devServer: {
        contentBase: path.join(__dirname, "dist"), //静态文件根目录
        port: 3824, // 端口
        host: '0.0.0.0',
        overlay: true,
        compress: false // 服务器返回浏览器的时候是否启动gzip压缩
    },
    // watch: true, // 开启监听文件更改，自动刷新
    // watchOptions: {
    //     ignored: /node_modules/, //忽略不用监听变更的目录
    //     aggregateTimeout: 500, //防止重复保存频繁重新编译,500毫米内重复保存不打包
    //     poll: 1000 //每秒询问的文件变更的次数
    // }
}