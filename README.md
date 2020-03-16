# Tencent Cloud Base(TCB) JavaScript SDK ![npm (tag)](https://img.shields.io/npm/v/tcb-js-sdk)

## 介绍

TCB 提供开发应用所需服务和基础设施。TCB JS SDK 让你可以在网页端使用 JavaScript 代码服务访问 TCB 的的服务。你可以使用该 SDK 构建自己的公众号页面或者独立的网站等 Web 服务。

## 安装

TCB JS SDK 可以通过 `tcb-js-sdk` 来访问：

```bash
npm install --save tcb-js-sdk@latest
```

要在你的模块式使用模块可以

```js
const tcb = require('tcb-js-sdk');
```

或

```js
import * as tcb from 'tcb-js-sdk';
```

或者使用官方的代码包

```
<script src="//imgcache.qq.com/qcloud/tcbjs/${version}/tcb.js">
```

> 最新版本与npm保持一致，可在https://www.npmjs.com/package/tcb-js-sdk中的Version一栏中查看。

## 快速上手

### 初始化

```javascript
// 引用官方 JS CDN 文件直接使用
const app = tcb.init({
  env: '你的环境 Id'
});
```

```js
// 模块化开发
const tcb = require('tcb-js-sdk');
const app = tcb.init({
  env: '你的环境 Id'
});
```

### 授权

```js
// 获取 auth 对象
const auth = app.auth({
  persistence: 'local'
});

// 微信登录
await auth
  .weixinAuthProvider({
    appid: '微信 appId',
    scope: 'snsapi_base'
  })
  .signIn(function() {});
```

### 使用

```js
// 调用云函数
const res = await app.callFunction({
  name: 'test',
  data: {
    str: base64
  }
});
```

## 文档

- [授权登录](docs/authentication.md)
- [存储](docs/storage.md)
- [数据库](docs/database.md)
- [云函数](docs/functions.md)

## 更新日志

查看 [更新日志](./changelog.md)

### 注意

> 1.0.1 版本后，为了提高文件上传性能，文件上传方式修改为直接上传到对象存储，为了防止在使用过程中出现 CORS 报错，需要到 Web 控制台 / 用户管理 / 登录设置选项中设置安全域名。如果已有域名出现 CORS 报错，请删除安全域名，重新添加。

### 开发

#### 安装依赖

```
npm install
```

或者

```
yarn
```

#### 单元测试

```
npm test unit
```

#### E2E 测试

依赖 puppeteer，在部分 linux 系统下跑不起来

```
npm run e2e
```

#### 构建
tcb-js-sdk构建分三个场景：
- npm package；
- 通用版全量js文件，适用于常规web、webview和小程序；
- cocos版全量js文件，仅适用于cocos。与通用版有以下区别区别：
  1. 使用superagent取代axios（axios不兼容cocos模拟器环境）；
  2. 不支持`session`登录保留期（cocos模拟器不支持`sessionStorage`）

执行以下命令：
```bash
npm run build
```
会同时构建npm package和通用版全量js文件，如下：
- `dist`目录为npm package文件；
- `tcb.js/${version}/tcb.js`为通用版js文件。

执行以下命令：
```bash
npm run build:cocos
```
会构建cocos版全量js文件，输出路径为`tcb.js/${version}-cocos/tcb.js`。