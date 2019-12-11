import { StorageInterface, SDKAdapterInterface } from '../types';
import { Request } from './web';

declare type CocosNamespace = {
  sys? : any;
  game? : any;
}
declare const cc: CocosNamespace;

function isCocosNative(): boolean {
  if (typeof cc === 'undefined') {
    return false;
  }
  if (typeof WebSocket === 'undefined') {
    return false;
  }
  if (typeof XMLHttpRequest === 'undefined') {
    return false;
  }

  if (!cc.game) {
    return false;
  }
  if (typeof cc.game.on !== 'function') {
    return false;
  }
  if (!cc.game.EVENT_HIDE) {
    return false;
  }
  if (!cc.game.EVENT_SHOW) {
    return false;
  }

  if (!cc.sys) {
    return false;
  }
  if (!cc.sys.isNative) {
    return false;
  }

  return true;
}

const ccStorage: StorageInterface = {
  setItem(key: string, value: any) {
    cc.sys.localStorage.setItem(key, value);
  },
  getItem(key: string): any {
    return cc.sys.localStorage.getItem(key);
  },
  removeItem(key: string) {
    cc.sys.localStorage.removeItem(key);
  },
  clear() {
    cc.sys.localStorage.clear();
  }
};

function genAdapter() {
  // cc原生环境无sessionStorage
  const adapter: SDKAdapterInterface = {
    root: window,
    reqClass: Request,
    wsClass: WebSocket,
    localStorage: ccStorage
  };
  return adapter;
}

export {
  genAdapter,
  isCocosNative
};