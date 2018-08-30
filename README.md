# steamer-kit-library

用于开发 `类库` 的脚手架


## 快速启动

* 推荐 >> 使用[steamerjs](https://steamerjs.github.io/docs/projectkits/Bootstrap.html)安装

```javascript

npm i -g steamerjs steamer-plugin-kit

// 下载脚手架到全局
steamer kit --add https://github.com/steamerjs/steamer-kit-library.git

// 选择并安装脚手架到项目中
steamer kit
```

* 或直接从github clone 下来

### 开发

```bash
npm run start

// 打开链接，查看 demo
localhost:9000
```

> ps：此处在开启开发模式下默认会自动打开浏览器。

### 代码规范扫描

```bash
npm run lint
```

> ps：此处的扫描在开发模式下是默认开启的，不需要手动执行lint。

### 测试

```bash
npm run karma
```

### 生产代码生成

```bash
// 使用 rollup 编译
npm run dist
```

## 文章参考
