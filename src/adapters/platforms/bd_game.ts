import { AbstractSDKRequest, IRequestOptions, IUploadRequestOptions, StorageInterface, WebSocketInterface, WebSocketContructor, SDKAdapterInterface } from '../types';
import { formatUrl } from '../../lib/util';

declare const swan;

function isBdGame(): boolean {
  if (typeof swan === 'undefined') {
    return false;
  }
  if (!swan.onHide) {
    return false;
  }
  if (!swan.offHide) {
    return false;
  }
  if (!swan.onShow) {
    return false;
  }
  if (!swan.offShow) {
    return false;
  }
  if (!swan.getSystemInfoSync) {
    return false;
  }
  if (!swan.getStorageSync) {
    return false;
  }
  if (!swan.setStorageSync) {
    return false;
  }
  if (!swan.connectSocket) {
    return false;
  }
  if (!swan.request) {
    return false;
  }

  try {
    if (!swan.getSystemInfoSync()) {
      return false;
    }
  } catch (e) {
    return false;
  }

  return true;
}

export class BdRequest extends AbstractSDKRequest {
  post(options: IRequestOptions) {
    const { url, data, headers } = options;
    return new Promise((resolve, reject) => {
      swan.request({
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
      swan.uploadFile({
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
    swan.downloadFile({
      url: formatUrl('https:', url),
      header: headers
    });
  }
}

export const bdMpStorage: StorageInterface = {
  setItem(key: string, value: any) {
    swan.setStorageSync(key, value);
  },
  getItem(key: string): any {
    return swan.getStorageSync(key);
  },
  removeItem(key: string) {
    swan.removeStorageSync(key);
  },
  clear() {
    swan.clearStorageSync();
  }
};

export class BdMpWebSocket {
  constructor(url: string, options: object = {}) {
    const READY_STATE = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
    };
    let readyState = READY_STATE.CONNECTING;

    const ws = swan.connectSocket({
      url,
      ...options
    });
    const socketTask: WebSocketInterface = {
      set onopen(cb) {
        ws.onOpen(e => {
          readyState = READY_STATE.OPEN;
          cb && cb(e);
        });
      },
      set onmessage(cb) {
        ws.onMessage(cb);
      },
      set onclose(cb) {
        ws.onClose(e => {
          readyState = READY_STATE.CLOSED;
          cb && cb(e);
        });
      },
      set onerror(cb) {
        ws.onError(cb);
      },
      send: (data) => ws.send({ data }),
      close: (code?: number, reason?: string) => ws.close({ code, reason }),
      get readyState() {
        return readyState;
      },
      CONNECTING: READY_STATE.CONNECTING,
      OPEN: READY_STATE.OPEN,
      CLOSING: READY_STATE.CLOSING,
      CLOSED: READY_STATE.CLOSED
    };
    return socketTask;
  }
}
function genAdapter() {
  // 小程序无sessionStorage
  const adapter: SDKAdapterInterface = {
    root: {},
    reqClass: BdRequest,
    wsClass: BdMpWebSocket as WebSocketContructor,
    localStorage: bdMpStorage
  };
  return adapter;
}
export { genAdapter, isBdGame };