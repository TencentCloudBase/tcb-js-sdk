const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('../webpack.config');
const package = require('../package.json');

module.exports = merge.strategy({
  // entry和module覆盖baseConfig
  entry: 'replace',
  module: 'replace'
})(baseConfig, {
  target: 'web',
  entry: [
    'regenerator-runtime/runtime', path.resolve(__dirname, '../src/index.ts')
  ],
  output: {
    path: path.resolve(__dirname, '../tcbjs'),
    filename: `${package.version}-cocos/tcb.js`,
    library: 'tcb',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          sourceType: 'unambiguous',
          presets: ['@babel/preset-env']
        }
      }, {
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, './tsconfig.cocos.json')
        }
      }]
    }]
  },
  resolve: {
    alias: {
      axios: path.resolve(__dirname, '../src/lib/iAxios.ts')
    }
  }
});