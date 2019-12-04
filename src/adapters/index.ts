import { RUNTIME } from './types';
import * as Web from './platforms/web';
import * as WX_MP from './platforms/wx_mp';
import * as CocosNative from './platforms/cocos_native';

export const { adapter, runtime } = (() => {
  if (WX_MP.isWxMp()) {
    return {
      adapter: WX_MP.genAdapter(),
      runtime: RUNTIME.WX_MP
    };
  }
  if (CocosNative.isCocosNative()) {
    return {
      adapter: CocosNative.genAdapter(),
      runtime: RUNTIME.COCOS_NATIVE
    };
  }
  return {
    adapter: Web.genAdapter(),
    runtime: RUNTIME.WEB
  };
})();
