const webpack = require('webpack');
const config = require('./webpack.config');

let copy = Object.assign({}, config);
copy.plugins.push(new webpack.DefinePlugin({
  'process.env': {
    'NODE_ENV': JSON.stringify('production')
  }
}));

module.exports = copy;
