import {
  Config,
  RequestMode,
  BASE_URL,
  ACCESS_TOKEN,
  ACCESS_TOKEN_Expire,
  REFRESH_TOKEN
} from '../types';
import { Cache } from './cache';
// import * as util from './util';
import { activateEvent } from './events';
import Axios from 'axios';

interface GetAccessTokenResult {
  accessToken: string;
  accessTokenExpire: number;
}

const actionsWithoutAccessToken = [
  'auth.getJwt',
  'auth.logout',
  'auth.signInWithTicket'
];

/**
 * @class RequestMethods
 */
class RequestMethods {
  private readonly _mode: RequestMode
  constructor(mode: RequestMode = RequestMode.WEB) {
    this._mode = mode;
  }
  public async post(url: string, data: KV<any> = {}, options: KV<any> = {}): Promise<KV<any>> {
    let res;
    switch (this._mode) {
      case RequestMode.WEB:
        res = await this._postWeb(url, data, options);
        break;
      case RequestMode.WX_MINIAPP:
        res = await this._postWxMiniApp(`https:${url}`, data, options);
        break;
    }
    return res;
  }
  public async upload(url: string, filePath: string, key: string, data: FormData, options: KV<any> = {}): Promise<KV<any>> {
    let res;
    switch (this._mode) {
      case RequestMode.WEB:
        data.append('file', filePath);
        data.append('key', key);
        res = await this._uploadWeb(url, data, options);
        break;
      case RequestMode.WX_MINIAPP:
        res = await this._uploadWxMiniApp(`https:${url}`, filePath, key, data, options);
        break;
    }
    return res;
  }
  public download(url: string) {
    switch (this._mode) {
      case RequestMode.WEB:
        this._downloadWeb(url);
        break;
      case RequestMode.WX_MINIAPP:
        this._downloadWxMiniApp(url);
        break;
    }
  }
  private _uploadWeb(url: string, data: KV<any> = {}, options: KV<any> = {}): Promise<any> {
    return Axios.post(url, data, options);
  }
  private _uploadWxMiniApp(url: string, filePath: string, key, formData: KV<any> = {}, options: KV<any> = {}) {
    return new Promise(resolve => {
      wx.uploadFile({
        url,
        filePath,
        name: key,
        formData,
        ...options,
        success(res) {
          resolve(res);
        },
        fail(err) {
          resolve(err);
        }
      });
    });
  }
  private _downloadWeb(url: string) {
    const fileName = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
    Axios
      .get(url, {
        responseType: 'blob'
      })
      .then(function (response) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
      });
  }
  private _downloadWxMiniApp(url: string) {
    wx.downloadFile({ url });
  }
  private _postWeb(url: string, data: KV<any> = {}, options: KV<any> = {}) {
    return Axios.post(url, data, options);
  }
  private _postWxMiniApp(url: string, data: KV<any> = {}, options: KV<any> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        data,
        method: 'POST',
        ...options,
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
/**
 * 默认配置
 * @constant DEFAULT_REQUEST_CONFIG
 */
const DEFAULT_REQUEST_CONFIG = {
  mode: RequestMode.WEB
};
/**
 * @internal
 */
class Request extends RequestMethods {
  config: Config;
  cache: Cache;
  accessTokenKey: string;
  accessTokenExpireKey: string;
  refreshTokenKey: string;
  _shouldRefreshAccessTokenHook: Function
  _refreshAccessTokenPromise: Promise<GetAccessTokenResult> | null

  /**
   * 初始化
   *
   * @internal
   * @param config
   */
  constructor(config: Config = DEFAULT_REQUEST_CONFIG) {
    super(config.mode);
    this.config = config;
    this.cache = new Cache(config.persistence);

    this.accessTokenKey = `${ACCESS_TOKEN}_${config.env}`;
    this.accessTokenExpireKey = `${ACCESS_TOKEN_Expire}_${config.env}`;
    this.refreshTokenKey = `${REFRESH_TOKEN}_${config.env}`;
  }

  async refreshAccessToken(): Promise<GetAccessTokenResult> {
    // 可能会同时调用多次刷新access token，这里把它们合并成一个
    if (!this._refreshAccessTokenPromise) {
      // 没有正在刷新，那么正常执行刷新逻辑
      this._refreshAccessTokenPromise = this._refreshAccessToken();
    }
    const result = await this._refreshAccessTokenPromise;
    this._refreshAccessTokenPromise = null;
    this._shouldRefreshAccessTokenHook = null;
    return result;
  }

  // 调用接口刷新access token，并且返回
  async _refreshAccessToken(): Promise<GetAccessTokenResult> {
    this.cache.removeStore(this.accessTokenKey);
    this.cache.removeStore(this.accessTokenExpireKey);

    let refreshToken = this.cache.getStore(this.refreshTokenKey);

    if (!refreshToken) {
      throw new Error('[tcb-js-sdk] 未登录CloudBase');
    }

    const response = await this.request('auth.getJwt', {
      refresh_token: refreshToken
    });
    if (response.data.code) {
      const { code } = response.data;
      if (code === 'SIGN_PARAM_INVALID' || code === 'REFRESH_TOKEN_EXPIRED' || code === 'INVALID_REFRESH_TOKEN') {
        activateEvent('loginStateExpire');
        this.cache.removeStore(this.refreshTokenKey);
      }
      throw new Error(`[tcb-js-sdk] 刷新access token失败：${response.data.code}`);
    }
    if (response.data.access_token) {
      activateEvent('refreshAccessToken');
      this.cache.setStore(this.accessTokenKey, response.data.access_token);
      // 本地时间可能没有同步
      this.cache.setStore(this.accessTokenExpireKey, response.data.access_token_expire + Date.now());
      return {
        accessToken: response.data.access_token,
        accessTokenExpire: response.data.access_token_expire
      };
    }
  }

  // 获取access token
  async getAccessToken(): Promise<GetAccessTokenResult> {
    // 如果没有access token或者过期，那么刷新
    let accessToken = this.cache.getStore(this.accessTokenKey);
    let accessTokenExpire = this.cache.getStore(this.accessTokenExpireKey);

    // 调用钩子函数
    let shouldRefreshAccessToken = true;
    if (this._shouldRefreshAccessTokenHook && !(await this._shouldRefreshAccessTokenHook(accessToken, accessTokenExpire))) {
      shouldRefreshAccessToken = false;
    }

    if ((!accessToken || !accessTokenExpire || accessTokenExpire < Date.now()) && shouldRefreshAccessToken) {
      // 返回新的access tolen
      return this.refreshAccessToken();
    } else {
      // 返回本地的access token
      return {
        accessToken,
        accessTokenExpire
      };
    }
  }

  async request(action, params, options?) {
    let contentType = 'application/x-www-form-urlencoded';

    const tmpObj = {
      action,
      env: this.config.env,
      dataVersion: '2019-08-16',
      ...params
    };

    // 下面几种 action 不需要 access token
    if (actionsWithoutAccessToken.indexOf(action) === -1) {
      tmpObj.access_token = (await this.getAccessToken()).accessToken;
    }

    // 拼body和content-type
    let payload;
    if (action === 'storage.uploadFile') {
      payload = new FormData();
      for (let key in payload) {
        if (payload.hasOwnProperty(key) && payload[key] !== undefined) {
          payload.append(key, tmpObj[key]);
        }
      }
      contentType = 'multipart/form-data';
    } else {
      contentType = 'application/json;charset=UTF-8';
      payload = tmpObj;
    }
    let opts: any = {
      headers: {
        'content-type': contentType
      },
    };
    if (options && options['onUploadProgress']) {
      opts.onUploadProgress = options['onUploadProgress'];
    }

    // 发出请求
    // 新的 url 需要携带 env 参数进行 CORS 校验
    const newUrl = `${BASE_URL}?env=${this.config.env}`;
    // const res = await axios.post(newUrl, payload, opts);
    const res: any = await this.post(newUrl, payload, opts);

    if ((Number(res.status) !== 200 && Number(res.statusCode) !== 200) || !res.data) {
      throw new Error('network request error');
    }

    return res;
  }

  async send(action: string, data: any = {}): Promise<any> {
    const slowQueryWarning = setTimeout(() => {
      console.warn('Database operation is longer than 3s. Please check query performance and your network environment.');
    }, 3000);
    const response = await this.request(action, data, { onUploadProgress: data.onUploadProgress });
    clearTimeout(slowQueryWarning);

    if (response.data.code === 'ACCESS_TOKEN_EXPIRED' && actionsWithoutAccessToken.indexOf(action) === -1) {
      // access_token过期，重新获取
      await this.refreshAccessToken();
      const response = await this.request(action, data, { onUploadProgress: data.onUploadProgress });
      if (response.data.code) {
        throw new Error(`[${response.data.code}] ${response.data.message}`);
      }
      return response.data;
    }

    if (response.data.code) {
      throw new Error(`[${response.data.code}] ${response.data.message}`);
    }

    return response.data;
  }
}

export { Request };
