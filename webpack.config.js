const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
let extractCss = new ExtractTextPlugin('/public/[name].css');

module.exports = {
  entry: './client/index.js',
  output: {
    path: 'build',
    filename: '/public/bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.scss$/, loader: extractCss.extract(['css-loader','sass-loader']) }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html'
    }),
    extractCss
  ],
};
