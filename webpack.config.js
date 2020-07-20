const path = require('path');
const webpack = require('webpack');
const package = require('./package.json');
const Visualizer = require('webpack-visualizer-plugin');

const modName = 'tcb';

// 合并声明文件plugin
// function DtsBundlePlugin() { }
// DtsBundlePlugin.prototype.apply = function (compiler) {
//   compiler.plugin('done', function () {
//     if (process.env.NODE_ENV === 'e2e') {
//       return;
//     }
//     const dts = require('dts-bundle');

//     dts.bundle({
//       name: modName,
//       main: 'dist/index.d.ts',
//       out: path.join(__dirname, `tcbjs/${package.version}/${modName}.d.ts`),
//       outputAsModuleFolder: true
//     });
//   });
// };

module.exports = {
  mode: 'production',
  // mode: 'development',
  // regenerator-runtime/runtime是Generator的polyfill
  // 解决async/await被babel转成generator后的兼容问题
  entry: [
    'regenerator-runtime/runtime', './dist/index.js'
  ],
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'tcbjs'),
    filename: process.env.NODE_ENV === 'e2e' ? 'e2e/tcb.js' : `${package.version}/${modName}.js`,
    library: modName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'typeof window !== "undefined"?window:this'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        // include: [
        //   path.resolve(__dirname, 'dist'),
        //   /node_modules\/@cloudbase\/database/
        // ],
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                modules: 'commonjs',
                // useBuiltIns: 'usage',
                corejs: 3
              }
            ]
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.END_POINT': JSON.stringify(process.env.END_POINT)
    }),
    new Visualizer({
      filename: './statistics.html'
    }),
    // new DtsBundlePlugin()
  ],
  // externals: { crypto: 'crypto'}
};