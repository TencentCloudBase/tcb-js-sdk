tcb-js-sdk默认支持web（浏览器）环境，其他平台需要安装对应的adapter，目前官方支持以下平台：
- 微信小游戏：[@cloudbase/adapter-wx_game](https://www.npmjs.com/package/@cloudbase/adapter-wx_game)
- QQ小程序：[@cloudbase/adapter-qq_mp](https://www.npmjs.com/package/@cloudbase/adapter-qq_mp)
- QQ小游戏：[@cloudbase/adapter-qq_game](https://www.npmjs.com/package/@cloudbase/adapter-qq_game)
- 百度小游戏：[@cloudbase/adapter-bd_game](https://www.npmjs.com/package/@cloudbase/adapter-bd_game)
- Cocos原生：[@cloudbase/adapter-cocos_native](https://www.npmjs.com/package/@cloudbase/adapter-cocos_native)
- Vivo小游戏：[@cloudbase/adapter-vv_game](https://www.npmjs.com/package/@cloudbase/adapter-vv_game)
- Oppo小游戏：[@cloudbase/adapter-oppo_game](https://git.code.oa.com/QBase/cloudbase-adapter-oppo_game)

## 使用方法
以百度小游戏为例，首先需要安装tcb-js-sdk和@cloudbase/adapter-bd_game：
```bash
npm i tcb-js-sdk @cloudbase/adapter-bd_game -S
```

然后在业务代码中引入SDK并使用adapter：
```js
import tcb from 'tcb-js-sdk';
import adapter from '@cloudbase/adapter-bd_game';

// adapter必须在调用tcb.init之前传入，否则无效
tcb.useAdapters(adapter);
tcb.init({
  env: 'your-env-id'
})
```

### 同时使用多个adapter
如果你的应用需要兼容多个平台，可以在同时使用多个adapter，tcb会根据传入的adapter自动识别应用的运行平台并进行适配。
```bash
npm i tcb-js-sdk @cloudbase/adapter-bd_game @cloudbase/adapter-vv_game -S
```

在业务代码中以数组的形式传入多个adapter：
```js
import tcb from 'tcb-js-sdk';
import adapterForBD from '@cloudbase/adapter-bd_game';
import adapterForVV from '@cloudbase/adapter-vv_game';

// adapter必须在调用tcb.init之前传入，否则无效
tcb.useAdapters([adapterForBD,adapterForVV]);
tcb.init({
  env: 'your-env-id'
})
```

## 适配更多平台
开发者可以根据自身业务需求开发其他平台的adapter，开发流程参考[@cloudbase/adapter-interface](https://www.npmjs.com/package/@cloudbase/adapter-interface)。