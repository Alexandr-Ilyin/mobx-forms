var webpack = require('webpack');
var path = require('path');
var _ = require('lodash');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var outputPath = path.resolve(__dirname, "./assets");

module.exports = function (isProduction, isHot) {
    var fs = require('fs');
    var deleteFolderRecursive = function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
    return {
        watch: true,
        context: path.join(__dirname, './'),
        entry: {
            'bundle': ['./app.tsx'],
            'testRunner': ['./components/testRunner/testRunner.ts'],
            'tests': ['./components/tests/tests.tsx']
        },
        output: {
            publicPath: '/app/assets/',
            path: outputPath,
            filename: isProduction ? '[name]_[hash].js' : '[name].js'
        },
        module: {
            rules: [
                {
                    test: /(\.react)?\.tsx?$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.(css|less|sass|scss)$/,
                    use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: "css-loader"
                    }),
                },
                {test: /\.less$/, loader: 'less-loader'},
                {test: /\.(woff.*|woff2.*|eot.*|svg.*|ttf.*)$/, loader: "file-loader"},
                {test: /\.(jpe?g|png|gif|svg|ttf)$/i, loader: "url-loader?limit=10000"}

            ]
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({name:'common', filename:'common.js'}),
            // new webpack.DllReferencePlugin({
            //     context: path.resolve(__dirname, "./assets-vendors"),
            //     manifest: require(path.resolve(__dirname, "./assets-vendors/vendors.json"))
            // }),
            new ExtractTextPlugin("[name].css"),
            function () {
                this.plugin("done", function (stats) {
                    if (!isProduction)
                        return;
                    var assets = stats.toJson().assetsByChunkName;
                    var result = _.reduce(assets, function(memo, item, key){
                        memo[key] = _.isArray(item) ? item : [item];
                        return memo;
                    },{});
                    var assetFileNames = {};
                    _.forEach(result, function(n,x){_.forEach(result[x], function(fName){assetFileNames[fName]=true})});
                    _.forEach(fs.readdirSync(outputPath), function(fName){
                        if (!/\.css$|\.js$/i.test(fName))
                            return;
                        if (!assetFileNames[fName])
                            fs.unlinkSync(path.join(outputPath,fName));
                        console.log("KIll " + path.join(outputPath,fName));
                    });
                    require("fs").writeFileSync(path.join(outputPath, "/webpack-assets.json"), JSON.stringify(result));
                });
            }

        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
    }
};
