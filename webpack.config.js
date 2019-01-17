const base =require("./webpackconf/webpack.config.base.js");
const prod =require("./webpackconf/webpack.config.prod.js");
const dev =require("./webpackconf/webpack.config.dev.js");
const merge =require("webpack-merge");
if(process.env.NODE_ENV==="production"){
    module.exports=merge(base,prod)
}else{
    module.exports=merge(base,dev)
}