## 应用初始化

参数

| 字段 | 类型 | 必填 | 说明|
| --- | --- | --- | --- |
| env | string | 是 | TCB 环境 ID，前往TCB控制台获取|

```javascript
// 初始化示例
//引用官方js包直接使用
var app = tcb.init({
    env: 'tcbenv-mPIgjhnq'
});

//模块化开发
const tcb = require('tcb-js-sdk')
const app =  tcb.init({
    env: 'tcbenv-mPIgjhnq'
});
```