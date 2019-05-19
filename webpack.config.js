/* eslint-disable */

const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const tsImportPluginFactory = require('ts-import-plugin')


module.exports = {
    entry: {
        index: './src/index.ts',
        convert: './src/convert.ts',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
        chunkFilename: '[id].[chunkhash].js'
    },
    // externals: ["fs"],
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(tsx|ts)$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                    compilerOptions: {
                        module: 'es2015'
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                    { loader: "sass-loader" },
                ]
            },
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                ]
            },

        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            filename: './index.html',
            template: './src/index.html',
            chunks: ['index',],
        }),
        new HtmlWebpackPlugin({
            hash: true,
            filename: './convert.html',
            template: './src/convert.html',
            chunks: ['convert',],
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
        }),
        new CopyPlugin([
            { from: './data', to: './data', },
        ]),
    ]
};