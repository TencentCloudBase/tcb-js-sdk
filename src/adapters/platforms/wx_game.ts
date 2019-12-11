import { WxMpWebSocket, wxMpStorage, WxRequest } from './wx_mp';
import { SDKAdapterInterface, WebSocketContructor, StorageType } from '../types';

// eslint-disable-next-line
declare const wx;
declare const GameGlobal;

function isWxGame(): boolean {
  if (typeof wx === 'undefined') {
    return false;
  }
  if (typeof GameGlobal === 'undefined') {
    return false;
  }
  if (!wx.onHide) {
    return false;
  }
  if (!wx.offHide) {
    return false;
  }
  if (!wx.onShow) {
    return false;
  }
  if (!wx.offShow) {
    return false;
  }
  if (!wx.getSystemInfoSync) {
    return false;
  }
  if (!wx.getStorageSync) {
    return false;
  }
  if (!wx.setStorageSync) {
    return false;
  }
  if (!wx.connectSocket) {
    return false;
  }
  if (!wx.request) {
    return false;
  }

  try {
    if (!wx.getSystemInfoSync()) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}

function genAdapter() {
  // 小程序无sessionStorage
  const adapter: SDKAdapterInterface = {
    root: GameGlobal,
    reqClass: WxRequest,
    wsClass: WxMpWebSocket as WebSocketContructor,
    localStorage: wxMpStorage,
    primaryStorage: StorageType.local
  };
  return adapter;
}

export { genAdapter, isWxGame };