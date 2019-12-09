import {
  SDKAdapterInterface,
  IRequestOptions,
  StorageInterface,
  IUploadRequestOptions,
  AbstractSDKRequest,
  WebSocketInterface,
  WebSocketContructor,
  StorageType
} from '../types';
import { formatUrl } from '../../lib/util';

// eslint-disable-next-line
declare const wx;
declare const App;
declare const Page;
declare const getApp;

/**
 * 判断是否为小程序runtime
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

export class WxRequest extends AbstractSDKRequest {
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
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: formatUrl('https:', url),
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
}

export const wxMpStorage: StorageInterface = {
  setItem(key: string, value: any) {
    wx.setStorageSync(key, value);
  },
  getItem(key: string): Promise<any> {
    return wx.getStorageSync(key);
  },
  removeItem(key: string) {
    wx.removeStorageSync(key);
  },
  clear() {
    wx.clearStorageSync();
  }
};

export class WxMpWebSocket {
  constructor(url: string, options: object = {}) {
    const ws = wx.connectSocket({
      url,
      ...options
    });

    const socketTask: WebSocketInterface = {
      set onopen(cb) {
        ws.onOpen(cb);
      },
      set onmessage(cb) {
        ws.onMessage(cb);
      },
      set onclose(cb) {
        ws.onClose(cb);
      },
      set onerror(cb) {
        ws.onError(cb);
      },
      send: (data) => ws.send({ data }),
      close: (code?: number, reason?: string) => ws.close({ code, reason }),
      get readyState() {
        return ws.readyState;
      },
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };
    return socketTask;
  }
}

function genAdapter() {
  // 小程序无sessionStorage
  const adapter: SDKAdapterInterface = {
    root: {},
    reqClass: WxRequest,
    wsClass: WxMpWebSocket as WebSocketContructor,
    localStorage: wxMpStorage,
    primaryStorage: StorageType.local
  };
  return adapter;
}

export { genAdapter, isWxMp };