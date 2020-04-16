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

