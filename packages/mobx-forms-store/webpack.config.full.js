var webpack = require('webpack');
var path = require('path');
var _ = require('lodash');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
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
		mode: isProduction ? 'production' : 'development',
        watch: true,
        context: path.join(__dirname, './'),
        entry: {
            'testRunner': ['../mobx-forms-tests/testRunner.ts','../mobx-forms-tests/testRunner.css'],
            'tests': ['./tests/index.tsx']
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
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        "css-loader"
                    ]
                },
                {test: /\.less$/, loader: 'less-loader'},
                {test: /\.(woff.*|woff2.*|eot.*|svg.*|ttf.*)$/, loader: "file-loader"},
                {test: /\.(jpe?g|png|gif|svg|ttf)$/i, loader: "url-loader?limit=10000"}
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),
            function () {
                this.plugin("done", function (stats) {
                    if (!isProduction)
                        return;
                    var assets = stats.toJson().assetsByChunkName;
                    var result = _.reduce(assets, function (memo, item, key) {
                        memo[key] = _.isArray(item) ? item : [item];
                        return memo;
                    }, {});
                    var assetFileNames = {};
                    _.forEach(result, function (n, x) {
                        _.forEach(result[x], function (fName) {
                            assetFileNames[fName] = true
                        })
                    });
                    _.forEach(fs.readdirSync(outputPath), function (fName) {
                        if (!/\.css$|\.js$/i.test(fName))
                            return;
                        if (!assetFileNames[fName])
                            fs.unlinkSync(path.join(outputPath, fName));
                        console.log("KIll " + path.join(outputPath, fName));
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
