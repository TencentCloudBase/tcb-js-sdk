import {
  SDKAdapterInterface,
  IRequestOptions,
  StorageInterface,
  IUploadRequestOptions,
  AbstractSDKRequest,
  WebSocketInterface,
  WebSocketContructor
} from '../types';
import { formatUrl } from '../../lib/util';

declare type WeixinMPObject = {
  setStorageSync(key: string, val: any): any;
  getStorageSync(key: string): any;
  removeStorageSync(key: string): any;
  clearStorageSync(): void;
  login(...args: any[]): void;
  request(...args: any[]): any;
  uploadFile(...args: any[]): any;
  downloadFile(...args: any[]): any;
  getSystemInfoSync(...args: any[]): any;
  onAppHide(...args: any[]): any;
  offAppHide(...args: any[]): any;
  onAppShow(...args: any[]): any;
  offAppShow(...args: any[]): any;
  connectSocket(...args: any[]): any;
};
// eslint-disable-next-line
declare const wx: WeixinMPObject;
declare const App;
declare const Page;
declare const getApp;

/**
 * 判断是否为小程序runtime
 * {@link https://git.code.oa.com/gamecloud_proj/game_sdk/blob/master/game/src/sdk/util/adapter/channel/wx_mp.ts}
 */
function isWxMp(): boolean {
  if (typeof wx === 'undefined') {
    return false;
  }
  if (typeof App === 'undefined') {
    return false;
  }
  if (typeof Page === 'undefined') {
    return false;
  }
  if (typeof getApp !== 'function') {
    return false;
  }
  if (!wx.onAppHide) {
    return false;
  }
  if (!wx.offAppHide) {
    return false;
  }
  if (!wx.onAppShow) {
    return false;
  }
  if (!wx.offAppShow) {
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

    if (wx.getSystemInfoSync().AppPlatform === 'qq') {
      return false;
    }

  } catch (e) {
    return false;
  }

  return true;
}

class Request extends AbstractSDKRequest {
  post(options: IRequestOptions) {
    const { url, data, headers } = options;
    return new Promise((resolve, reject) => {
      wx.request({
        url: formatUrl('https:', url),
        data,
        method: 'POST',
        header: headers,
        success(res) {
          resolve(res);
        },
        fail(err) {
          reject(err);
        }
      });
    });
  }
  upload(options: IUploadRequestOptions) {
    return new Promise(resolve => {
      const { url, file, name, data, headers } = options;
      wx.uploadFile({
        url: formatUrl('https:', url),
        name,
        formData: data,
        filePath: file,
        header: headers,
        success(res) {
          const result = {
            statusCode: res.statusCode,
            data: res.data || {}
          };
          // 200转化为201（如果指定）
          if (res.statusCode === 200 && data.success_action_status) {
            result.statusCode = parseInt(data.success_action_status, 10);
          }
          resolve(result);
        },
        fail(err) {
          resolve(err);
        }
      });
    });
  }
  download(options: IRequestOptions) {
    const { url, headers } = options;
    wx.downloadFile({
      url: formatUrl('https:', url),
      header: headers
    });
  }
}
const wxMpStorage: StorageInterface = {
  setItem(key: string, value: any) {
    wx.setStorageSync(key, value);
  },
  getItem(key: string): any {
    return wx.getStorageSync(key);
  },
  removeItem(key: string) {
    wx.removeStorageSync(key);
  },
  clear() {
    wx.clearStorageSync();
  }
};

class WxMpWebSocket {
  constructor(url: string, options: object = {}) {
    const ws = wx.connectSocket({
      url,
      ...options
    });
    const socketTask: WebSocketInterface = {
      onopen: (cb) => ws.onOpen(cb),
      onclose: (cb) => ws.onClose(cb),
      onerror: (cb) => ws.onOpen(cb),
      onmessage: (cb) => ws.onMessage(cb),
      send: (data) => ws.send({ data }),
      close: (code?: number, reason?: string) => ws.close({ code, reason }),
      get readyState() {
        return ws.readyState;
      }
    };
    return socketTask;
  }
}

function genAdapter() {
  // 小程序无sessionStorage
  const adapter: SDKAdapterInterface = {
    root: {},
    reqClass: Request,
    wsClass: WxMpWebSocket as WebSocketContructor,
    localStorage: wxMpStorage
  };
  return adapter;
}

export { genAdapter, isWxMp };