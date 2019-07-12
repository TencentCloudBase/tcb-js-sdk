# Tencent Cloud Base(TCB) JavaScript SDK

## 目录
* [介绍](#介绍)
* [安装](#安装)
* [文档](#文档)


## 介绍
TCB提供开发应用所需服务和基础设施。tcb js SDK 让你可以在网页端使用JavaScript代码服务访问TCB的的服务。

## 安装
tcb js SDK 可以通过`tcb-js-sdk`来访问：
```bash
npm install --save tcb-js-sdk@latest
```

要在你的模块式使用模块可以
```js
var tcb = require("tcb-js-sdk");
```
或
```js
import * as tcb from "tcb-js-sdk";
```

或者使用官方的代码包
```
    <script src="">
```

## 文档
* [初始化](docs/initialization.md)
* [存储](docs/storage.md)
* [数据库](docs/database.md)
* [云函数](docs/functions.md)

## 更新日志

查看[更新日志](./changelog.md)


### 注意

> 1.0.1 版本后，为了提高文件上传性能，文件上传方式修改为直接上传到对象存储，为了防止在使用过程中出现 CORS 报错，需要到 Web 控制台/用户管理/登录设置选项中设置安全域名。如果已有域名出现 CORS 报错，请删除安全域名，重新添加。