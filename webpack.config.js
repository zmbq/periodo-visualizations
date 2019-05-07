/* eslint-disable */

const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.ts',
  output: {
      path: path.resolve(__dirname, './dist'),
      filename: 'bundle.js',
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
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
    },
    {
      test: /\.scss$/, use: [ 
        { loader: "style-loader" },
        { loader: "css-loader" },
        { loader: "sass-loader" },
    ] }, 
    {
      test: /\.css$/, use: [ 
        { loader: "style-loader" },
        { loader: "css-loader" },
    ] }, 
  ]},
  plugins: [
      new HtmlWebpackPlugin({
          hash: true,
          filename: './index.html',
          template: './src/index.html',
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
      }),
      new CopyPlugin([
          { from: './data', to: './data', },
      ]),
  ]
};