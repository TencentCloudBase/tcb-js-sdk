const webpack = require('webpack');
const path = require('path');
const package = require('./package.json');
const Visualizer = require('webpack-visualizer-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const modName = 'tcb';

module.exports = {
  mode: 'production',
  entry: [
    './src/index.ts'
  ],
  // devtool: 'inline-source-map',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'tcbjs'),
    filename: `${package.version}/${modName}.js`,
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
    new webpack.HotModuleReplacementPlugin(),
    new Visualizer({
      filename: './statistics.html'
    }),
    // new BundleAnalyzerPlugin()
  ]
};