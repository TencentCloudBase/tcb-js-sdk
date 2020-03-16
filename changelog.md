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

