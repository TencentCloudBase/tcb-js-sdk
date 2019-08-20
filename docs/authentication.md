## 登录授权

目前支持微信授权，包括微信公众平台（公众号网页）和开放平台（普通网站应用）的网页授权。不支持匿名访问，因此在初始化资源后请立即调用本页面所描述的接口做登录授权，登录成功前其它的数据请求将不能成功发出。

使用 js sdk 时，您可以指定身份认证状态如何持久保留，以避免需要用户频繁登录授权。相关选项包括：已登录的用户是在显式退出登录之前的 30 天内保留身份验证状态(local)、在窗口关闭时清除身份验证状态(session)，还是在页面重新加载时清除身份验证状态(none)。

--------------

### 获取登录对象

请求参数

| 字段        | 类型   | 必填 | 说明                                                                        |
| ----------- | ------ | ---- | --------------------------------------------------------------------------- |
| persistence | string | 否   | 身份认证状态如何持久保留，有三个选项 local、session 和 none，默认为 session |

```js
let app = tcb.init({
  env: "yyy"
});

let app2 = tcb.init({
  env: "yyy"
});

// 一个app下只有一个auth对象
let auth = app.auth({
  persistence: "local"
});
```

#### 监听登录态失效事件

```js
let auth = app.auth({
  persistence: "local"
});
auth.onLoginStateExpire(callback);
```

-------------------

#### 微信公众平台及开放平台登录认证

请求参数

| 字段  | 类型   | 必填 | 说明                                                                                                                                              |
| ----- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| appid | string | 是   | 微信公众平台（或开放平台）应用的 appid                                                                                                            |
| scope | string | 是   | 网页授权类型，可选值为 snsapi_base(公众平台，只获取用户的 openid)、snsapi_userinfo(公众平台，获取用户的基本信息)和 snsapi_login(开放平台网页授权) |

```javascript
let app = tcb.init({
  env: "xxxx-yyy"
});

app
  .auth()
  .weixinAuthProvider({
    appid: "wx73932328juof23",
    scope: "snsapi_base"
  })
  .signIn(function(err, res) {});
```

---------------------

#### 自定义登录

CloudBase 允许开发者使用特定的登录凭据 Ticket 对用户进行身份认证。开发者可以使用服务端 SDK 来创建 Ticket，并且将 JWT 传入到 Web 应用内，然后调用 `signInWithTicket()` 获得 CloudBase 的登录态。

##### 1. 获取私钥文件


##### 2. 使用私钥文件

获取私钥文件之后，在服务端 SDK 初始化时，加入私钥文件的路径：

```js
// 开发者的服务端代码
// 初始化示例
const tcb = require('tcb-admin-node');

// 1. 直接使用下载的私钥文件
tcb.init({
  // ...
  credentials: require('/path/to/your/credentials.json')
});

// 2. 也可以直接传入私钥的内容
tcb.init({
  // ...
  credentials: {
    private_key_id: 'xxxxxxxxxxxxx',
    private_key: 'xxxxxxxxxxx'
  }
});
```

##### 3. 使用服务端 SDK 创建登录凭据 Ticket

服务端 SDK 内置了生成 Ticket 的接口，开发者需要提供一个自定义的 `uid` 作为用户的唯一身份标识。Ticket 有效期为 5 分钟，过期则失效。

```js
let uid = '123456';

const ticket = tcb.auth().createTicket(uid, {
  refresh: 10 * 60 * 1000 // 每十分钟刷新一次登录态， 默认为一小时
});
// 然后把 ticket 发送给 Web 端
```

##### 4. Web 端上使用 Ticket 登录

创建 Ticket 之后，开发者应将 Ticket 发送至 Web 端，然后使用 Web SDK 提供的 `signInWithTicket()` 登录 CloudBase：

```js
auth.signInWithTicket(ticket).then(() => {
  // 登录成功
})
```

-----

#### 手动创建自定义登录凭据 Ticket

如果服务端没有使用 Cloudbase 提供的 SDK，或者 SDK 无法满足需求，依然可以使用[相应语言的 JWT 库](https://jwt.io/)和自定义登录的私钥文件自行创建登录凭据。

首先，使用 JWT 库创建一个包含以下信息的 JWT：

| 字段    | 说明             | 取值                                       |
| ------- | ---------------- | ------------------------------------------ |
| alg     | 算法             | "RS256"                                    |
| env     | Cloudbase 环境名 | 对应的环境名                               |
| iat     | Ticket颁发时间   | 当前时间（Unix时间戳对应的毫秒数）         |
| exp     | Ticket过期时间   | Ticket过期的时间（Unix时间戳对应的毫秒数） |
| uid     | 自定义uid        | 自定义的用户全局唯一id                     |
| refresh | 登录态刷新时间   | 毫秒数，上限为 1 小时（3600000毫秒）       |
| expire  | 登录态过期时间   | Unix时间戳对应的毫秒数                     |

以 JavaScript 为例：

```js
const jwt = require('jsonwebtoken')

// 读取私钥文件
const credentials = require('path/to/tcb_custom_login.json')

// 指定环境和uid
const env = 'your-env-id'
const uid = '123456'

// 创建 JWT
const now = new Date().getTime()
const token = jwt.sign(
  {
    alg: 'RS256',
    env: env,
    iat: now,
    exp: now + 10 * 60 * 1000, // ticket十分钟有效
    uid: uid,
    refresh: 3600 * 1000, // 每一小时刷新一次登录态
    expire: now + 7 * 24 * 60 * 60 * 1000 // 登录态维持一周有效
  },
  credentials.private_key,
  { algorithm: 'RS256' }
)

// 然后拼接出 Ticket
const ticket = credentials.private_key_id + '/@@/' + token

console.log(ticket)
```
