tcb-js-sdk默认支持web（浏览器）和微信小程序环境，其他平台需要安装对应的adapter，目前官方支持以下平台：
- 微信小游戏：[@cloudbase/adapter-wx_game](https://www.npmjs.com/package/@cloudbase/adapter-wx_game)
- QQ小程序：[@cloudbase/adapter-qq_mp](https://www.npmjs.com/package/@cloudbase/adapter-qq_mp)
- QQ小游戏：[@cloudbase/adapter-qq_game](https://www.npmjs.com/package/@cloudbase/adapter-qq_game)
- 百度小游戏：[@cloudbase/adapter-bd_game](https://www.npmjs.com/package/@cloudbase/adapter-bd_game)
- Cocos原生：[@cloudbase/adapter-cocos_native](https://www.npmjs.com/package/@cloudbase/adapter-cocos_native)
- Vivo小游戏：[@cloudbase/adapter-vv_game](https://www.npmjs.com/package/@cloudbase/adapter-vv_game)
- Oppo小游戏：@cloudbase/adapter-oppo_game(待补充)

开发者可以根据自身业务需求开发其他平台的adapter，开发流程参考[@cloudbase/adapter-interface](https://www.npmjs.com/package/@cloudbase/adapter-interface)。