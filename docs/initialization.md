## 应用初始化

参数

| 字段 | 类型 | 必填 | 说明|
| --- | --- | --- | --- |
| env | string | 是 | TCB 环境 ID，不填使用默认环境|
| appid | string | 是 | 微信应用(公众号或微信网页授权)appid |
| scope | string | 是 | 微信登录授权类型，可选值snsapi_base、snsapi_userinfo和snsapi_login，分别对应微信公众平台的基础授权和用户信息授权，微信开放平台的网页授权。
| timeout | number | 否 | 调用接口的超时时间（ms），默认为 15000，即 15 秒 |

```javascript
// 初始化示例
//引用官方js包直接使用
var app = tcb.init({
    appid: 'wxacfb81f2ced64e70',
    env: 'tcbenv-mPIgjhnq',
    scope: 'snsapi_base'
});

//模块化开发
const tcb = require('tcb-js-sdk')
const app =  tcb.init({
    appid: 'wxacfb81f2ced64e70',
    env: 'tcbenv-mPIgjhnq',
    scope: 'snsapi_base'
});
```