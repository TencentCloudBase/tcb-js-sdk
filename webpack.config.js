
const webpack = require('webpack');

const modName = 'tcb-js-sdk';

module.exports = {
  entry: [
    // 给webpack-dev-server启动一个本地服务，并连接到8080端口
    'webpack-dev-server/client?http://localhost:8080',

    // 给上面启动的本地服务开启自动刷新功能，'only-dev-server'的'only-'意思是只有当模块允许被热更新之后才有热加载，否则就是整页刷新
    'webpack/hot/only-dev-server',

    './src/index.ts'
  ],
  devtool: 'inline-source-map',
  // devServer: {
  //   contentBase: './dist',
  //   disableHostCheck: true,
  //   hot: true
  // },
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