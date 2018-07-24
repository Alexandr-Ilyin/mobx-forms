var path = require('path');
var Webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config.full.js')();
webpackConfig.output.path = path.resolve(__dirname, "./app/assets");

var port = 8939;
var bundleStart = null;

var compiler = Webpack(webpackConfig);
compiler.plugin('compile', function() {     console.log('Bundling...');     bundleStart = Date.now();});
compiler.plugin('done', function(stats) {

    console.log('Bundled in ' + (Date.now() - bundleStart) + 'ms! Now:' + Date.now());
});

var bundler = new WebpackDevServer(compiler, {
    publicPath: '/app/assets',
    hot: false,
    quiet: false,
    noInfo: true,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    stats: {
        children:false,
        chunkModules : false ,
        cached: false,
        colors: true,
        errorDetails: true,
        chunkOrigins: false
    }
    // proxy: {
    //     "/webapi/*": {
    //         target: "http://localhost.dev.kontur:8080/",
    //         secure: false
    //     }
    // }
});
bundler.listen(port, null, function () {
    console.log('Bundling project, please wait...');
});