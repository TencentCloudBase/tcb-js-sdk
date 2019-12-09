import { RUNTIME } from './types';
import * as Web from './platforms/web';
import * as WX_MP from './platforms/wx_mp';
// import * as WX_GAME from './platforms/wx_game';
// import * as QQ_MP from './platforms/qq_mp';
// import * as BD_GAME from './platforms/bd_game';
// import * as CocosNative from './platforms/cocos_native';

export const { adapter, runtime } = (() => {
  // if (BD_GAME.isBdGame()) {
  //   return {
  //     adapter: BD_GAME.genAdapter(),
  //     runtime: RUNTIME.BD_GAME
  //   };
  // }
  // if (QQ_MP.isQQMp()) {
  //   return {
  //     adapter: QQ_MP.genAdapter(),
  //     runtime: RUNTIME.QQ_MP
  //   };
  // }
  // if (WX_GAME.isWxGame()) {
  //   return {
  //     adapter: WX_GAME.genAdapter(),
  //     runtime: RUNTIME.WX_GAME
  //   };
  // }
  if (WX_MP.isWxMp()) {
    return {
      adapter: WX_MP.genAdapter(),
      runtime: RUNTIME.WX_MP
    };
  }
  // if (CocosNative.isCocosNative()) {
  //   return {
  //     adapter: CocosNative.genAdapter(),
  //     runtime: RUNTIME.COCOS_NATIVE
  //   };
  // }
  return {
    adapter: Web.genAdapter(),
    runtime: RUNTIME.WEB
  };
})();
