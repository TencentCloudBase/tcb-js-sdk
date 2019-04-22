## 介绍
tcb 提供开发应用所需服务和基础设施。js SDK 让你可以在网页端使用JavaScript代码访问TCB的云服务。
你可以使用该SDK构建自己的公众号页面或者独立的网站等web服务。

## 使用方式

<br>
1. tcb js SDK 可以通过npm安装：

```bash
    npm install --save tcb-js-sdk@latest
```

##### 在你的项目里使用模块化开发，你只需要直接引入：

```js
    const tcb = require("tcb-js-sdk");
```
##### 或
```js
    import * as tcb from "tcb-js-sdk";
```

<br>
2. 当然也可以直接在你的页面使用官方压缩过的代码包

```
    <script src="">
```