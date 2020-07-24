# 更新日志

## 说明

遵守规范：[keepachangelog](https://keepachangelog.com/zh-CN/1.0.0/)

### 变动类型

- `Added` 新添加的功能。
- `Changed` 对现有功能的变更。
- `Deprecated` 已经不建议使用，准备很快移除的功能。
- `Removed` 已经移除的功能。
- `Fixed` 对bug的修复
- `Security` 对安全的改进

## [1.10.4] 2020-07-24

- [Fix] 修复非 Node.js 环境下访问 `process` 造成报错的问题

## [1.10.4] 2020-07-22

- [Fix] 修复 `LoginState.isWeixinAuth` 失效问题
- [Fix] 修复 `Auth.currentUser` 上的用户信息无法解构赋值

## [1.10.3] 2020-07-20
- [Fix] 修复微信小程序上传图片不完整问题

## [1.10.2] 2020-07-17

- [Changed] `WeixinAuthProvider.signIn()` 新增 `syncUserInfo` 参数，同步微信账号信息作为用户信息
- [Changed] `WeixinAuthProvider.getRedirectResult()` 新增 `syncUserInfo` 参数，同步微信账号信息作为用户信息

## [1.10.1] 2020-07-16
- [Fix] 修复 `callFunction` 入参语法提示错误
- [Fix] 优化数据库 API 错误处理

## [1.10.0] 2020-07-16

- [Added] 新增账号密码登录的相关接口
  - `Auth.signInWithUsernameAndPassword()`
  - `Auth.isUsernameRegistered()`
  - `User.updateUsername()`

## [1.9.0] 2020-07-06 
- [Added] 新增未登录请求模式，本地无登录态时可以请求资源。

## [1.8.0] 2020-06-30

- [Added] 新增邮箱密码登录的相关接口
  - `Auth.signUpWithEmailAndPassword()`
  - `Auth.signInWithEmailAndPassword()`
  - `Auth.sendPasswordResetEmail()`
  - `User.updatePassword()`
  - `User.updateEmail()`
- [Changed] `Storage.downloadFile` 浏览器环境下可直接保存文件

## [1.7.1] 2020-06-09

- [Fixed] 修复 `User.isWeixinAuth` 返回结果不准确的问题
- [Fixed] 修复 `User.openid`、`User.unionId`、`LoginState.loginType` 返回结果不准确的问题
- [Fixed] 修复 `Auth.hasLoginState()`、`Auth.getLoginState()` 在短期密钥失效后返回 null 的问题

## [1.7.0] 2020-06-05
- [Added] 新增用户信息读写接口
  - `LoginState`
    - `LoginState.loginType`
    - `LoginState.user`
    - `LoginState.isAnonymousAuth()`
    - `LoginState.isCustomAuth()`
    - `LoginState.isWeixinAuth()`
  - `User`
    - `User.uid`
    - `User.loginType`
    - `User.openid`
    - `User.unionId`
    - `User.qqMiniOpenId`
    - `User.nickName`
    - `User.gender`
    - `User.avatarUrl`
    - `User.location`
    - `User.update()`
    - `User.refresh()`
  - `Auth`
    - `Auth.currentUser`
- [Added] 新增用户关联接口
  - `User.linkWithTicket()`
  - `User.linkWithRedirect()`
  - `User.getLinkedUidList()`
  - `User.setPrimaryUid()`
  - `User.unlink()`
  - `WeixinAuthProvider.getLinkRedirectResult()`

## [1.6.3] 2020-05-27
- [Fixed] 兼容Windows操作系统PC微信打开的网页

## [1.6.2] 2020-05-22
- [Fixed] 兼容chrome 53内核运行环境

## [1.6.1] 2020-04-17
- [Fixed] 修复 `persistence`取值`'session'` 导致重复匿名登录无法继承本地状态

## [1.6.0] 2020-04-16
- [Changed] `Auth.onLoginStateChanged()` 的回调中，会传入 `LoginState`，并且会在订阅时自动触发一次
- [Changed] `Auth.onLoginTypeChanged()` 的回调中，会传入 `LoginState`
- [Fixed] 修复 `uploadFile()` 无法监听进度bug

## [1.5.0] 2020-03-19

### Added

- 新增 `Auth.customAuthProvider()`，提供自定义登录功能
- 新增 `Auth.anonymousAuthProvider()`，提供匿名登录功能
- 新增 `Auth.getAuthHeader()`，用于获取云接入 HTTP 鉴权头部
- 新增 `Auth.onLoginStateChanged()`，用于订阅登录状态改变
- 新增 `Auth.onLoginStateExpired()`，用于订阅登录状态过期
- 新增 `Auth.onAccessTokenRefreshed()`，用于订阅短期令牌刷新
- 新增 `Auth.onAnonymousConverted()`，用于订阅匿名登录状态转换
- 新增 `Auth.onLoginTypeChanged()`，用于订阅登录类型变化

### Deprecated

- 废弃 `Auth.on()`，将会在下一个版本被移除
- 废弃 `Auth.signInAnonymously()`，将会在下一个版本被移除
- 废弃 `Auth.signInWithTicket()`，将会在下一个版本被移除

## [1.4.0] 2020-03-16

### Added

- 新增 `tcb.registerExtension()`，注册扩展
- 新增 `tcb.invokeExtension()`，使用扩展

## [1.2.0] 2019-08-14

### Added

- 新增 `Auth.signInWithTicket()`，支持自定义登录
- 新增 `"refreshAccessToken"` 事件，当 Access Token 刷新成功时会触发这个事件
- 新增 `Auth.shouldRefreshAccessToken()`，作为决定刷新 Access Token 的钩子函数

## [1.0.1] 2019-07-01

### Changed

- 增加跨域访问存储文件支持
- 文件上传模式修改为直接上传对象存储，去除文件大小限制

