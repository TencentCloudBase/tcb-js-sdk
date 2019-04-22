## 登录授权

目前支持微信授权，包括微信公众平台（公众号网页）和开放平台（普通网站应用）的网页授权。不支持匿名访问，因此在初始化资源后请立即调用本页面所描述的接口做登录授权，登录成功前其它的数据请求将不能成功发出。

### 微信公众平台及开放平台登录认证
请求参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| appid | string | 是 | 微信公众平台（或开放平台）应用的appid
| scope | string | 是 | 网页授权类型，可选值为snsapi_base(公众平台，只获取用户的openid)、snsapi_userinfo(公众平台，获取用户的基本信息)和snsapi_login(开放平台网页授权)

```javascript
let app = tcb.init({
    env: 'xxxx-yyy'
});

app.auth().weixinAuthProvider({
    appid: 'wx73932328juof23',
    scope: 'snsapi_base'
})
```
