import axios from 'axios';

import {
  Config,
  BASE_URL,
  ACCESS_TOKEN,
  ACCESS_TOKEN_Expire,
  REFRESH_TOKEN
} from '../types';
import { Cache } from './cache';
// import * as util from './util';
import { activateEvent } from './events';

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
 * @internal
 */
class Request {
  config: Config;
  cache: Cache;
  accessTokenKey: string;
  accessTokenExpireKey: string;
  refreshTokenKey: string;
  _shouldRefreshAccessTokenHook: Function

  /**
   * 初始化
   *
   * @internal
   * @param config
   */
  constructor(config?: Config) {
    this.config = config;
    this.cache = new Cache(config.persistence);

    this.accessTokenKey = `${ACCESS_TOKEN}_${config.env}`;
    this.accessTokenExpireKey = `${ACCESS_TOKEN_Expire}_${config.env}`;
    this.refreshTokenKey = `${REFRESH_TOKEN}_${config.env}`;
  }

  // 调用接口刷新access token，并且返回
  async refreshAccessToken(): Promise<GetAccessTokenResult> {
    this.cache.removeStore(this.accessTokenKey);
    this.cache.removeStore(this.accessTokenExpireKey);

    let refreshToken = this.cache.getStore(this.refreshTokenKey);

    if (!refreshToken) {
      throw new Error('[tcb-js-sdk] 未登录CloudBase');
    }

    const response = await this.request('auth.getJwt', {
      refresh_token: refreshToken
    });
    if (response.data.code === 'SIGN_PARAM_INVALID' || response.data.code === 'REFRESH_TOKEN_EXPIRED') {
      activateEvent('loginStateExpire');
      this.cache.removeStore(this.refreshTokenKey);
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
    const res = await axios.post(newUrl, payload, opts);

    if (Number(res.status) !== 200 || !res.data) {
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
