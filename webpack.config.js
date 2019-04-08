const webpack = require('webpack');

const modName = 'tcb-js-sdk';

module.exports = {
  mode: 'production',
  entry: [
    './src/index.ts'
  ],
  // devtool: 'inline-source-map',
  devtool: false,
  output: {
    filename: `./${modName}.js`,
    library: modName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?presets[]=es2015!ts-loader'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};