const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            filename: './index.html',
            template: './src/index.html',
        }),
        //new CopyPlugin([
        //    { from: './data/*.json', to: '/assets/*', },
        //]),
    ]
  };