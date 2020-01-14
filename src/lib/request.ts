import {
  Config,
  BASE_URL,
  SDK_VERISON,
  KV,
  protocol
} from '../types';
import { cache } from './cache';
import { activateEvent, EVENTS } from './events';
import { IRequestOptions, SDKRequestInterface, ResponseObject, IUploadRequestOptions } from '@cloudbase/adapter-interface';
import { genSeqId, isFormData, formatUrl } from './util';
import { Adapter } from '../adapters';
import { LOGINTYPE } from '../auth/base';

// import { getTcbFingerprintId } from '../auth/fingerprint';


interface GetAccessTokenResult {
  accessToken: string;
  accessTokenExpire: number;
}

export type CommonRequestOptions = {
  headers?: KV<string>;
  responseType?: string;
  onUploadProgress?: Function;
}

type AppendedRequestInfo = {
  data: KV<any>;
  headers: KV<string>;
}
interface RequestBeforeHook {
  (...args: any[]): AppendedRequestInfo;
}
const actionsWithoutAccessToken = [
  'auth.getJwt',
  'auth.logout',
  'auth.signInWithTicket',
  'auth.signInAnonymously'
];

const commonHeader = {
  'X-SDK-Version': SDK_VERISON
};

function bindHooks(instance: SDKRequestInterface, name: string, hooks: RequestBeforeHook[]) {
  const originMethod = instance[name];
  instance[name] = function (options: IRequestOptions) {
    const data = {};
    const headers = {};
    hooks.forEach(hook => {
      const { data: appendedData, headers: appendedHeaders } = hook.call(instance, options);
      Object.assign(data, appendedData);
      Object.assign(headers, appendedHeaders);
    });
    const originData = options.data;
    originData && (() => {
      if (isFormData(originData)) {
        for (const key in data) {
          (originData as FormData).append(key, data[key]);
        }
        return;
      }
      options.data = {
        ...originData,
        ...data
      };
    })();
    options.headers = {
      ...(options.headers || {}),
      ...headers
    };
    return (originMethod as Function).call(instance, options);
  };
}
function beforeEach(): AppendedRequestInfo {
  const seqId = genSeqId();
  return {
    data: {
      seqId
    },
    headers: {
      ...commonHeader,
      'x-seqid': seqId
    }
  };
}
/**
 * @class Request
 */
class Request {
  config: Config;
  _shouldRefreshAccessTokenHook: Function
  _refreshAccessTokenPromise: Promise<GetAccessTokenResult> | null
  _reqClass: SDKRequestInterface;
  /**
   * 初始化
   * @param config
   */
  constructor(config: Config = {}) {
    this.config = config;
    // init有两种场景：
    // 1. adapter初始化后被调用,适用于tcb.init;
    // 2. new Request被调用,适用于database中new Request
    try {
      this.init(config);
    } catch (e) {}
  }
  init(config: Config = {}) {
    this.config = config;
    // eslint-disable-next-line
    this._reqClass = new Adapter.adapter.reqClass();
    bindHooks(this._reqClass, 'post', [beforeEach]);
    bindHooks(this._reqClass, 'upload', [beforeEach]);
    bindHooks(this._reqClass, 'download', [beforeEach]);
  }
  async post(options: IRequestOptions): Promise<ResponseObject> {
    const res = await this._reqClass.post(options);
    return res;
  }
  async upload(options: IUploadRequestOptions): Promise<ResponseObject> {
    const res = await this._reqClass.upload(options);
    return res;
  }
  async download(options: IRequestOptions): Promise<ResponseObject> {
    const res = await this._reqClass.download(options);
    return res;
  }

  async refreshAccessToken(): Promise<GetAccessTokenResult> {
    // 可能会同时调用多次刷新access token，这里把它们合并成一个
    if (!this._refreshAccessTokenPromise) {
      // 没有正在刷新，那么正常执行刷新逻辑
      this._refreshAccessTokenPromise = this._refreshAccessToken();
    }

    let result;
    let err;
    try {
      result = await this._refreshAccessTokenPromise;
    } catch (e) {
      err = e;
    }
    this._refreshAccessTokenPromise = null;
    this._shouldRefreshAccessTokenHook = null;
    if (err) {
      throw err;
    }
    return result;
  }

  // 调用接口刷新access token，并且返回
  async _refreshAccessToken(): Promise<GetAccessTokenResult> {
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey, loginTypeKey, anonymousUuidKey } = cache.keys;
    cache.removeStore(accessTokenKey);
    cache.removeStore(accessTokenExpireKey);

    let refreshToken = cache.getStore(refreshTokenKey);
    if (!refreshToken) {
      throw new Error('[tcb-js-sdk] 未登录CloudBase');
    }
    const params: KV<string> = {
      refresh_token: refreshToken,
    };
    const isAnonymous = cache.getStore(loginTypeKey) === LOGINTYPE.ANONYMOUS;
    if (isAnonymous) {
      // 匿名登录时传入uuid，若refresh token过期则可根据此uuid进行延期
      params.anonymous_uuid = cache.getStore(anonymousUuidKey);
    }
    const response = await this.request('auth.getJwt', params);
    if (response.data.code) {
      const { code } = response.data;
      if (code === 'SIGN_PARAM_INVALID' || code === 'REFRESH_TOKEN_EXPIRED' || code === 'INVALID_REFRESH_TOKEN') {
        activateEvent(EVENTS.LOGIN_STATE_EXPIRE);
        cache.removeStore(refreshTokenKey);
      }
      throw new Error(`[tcb-js-sdk] 刷新access token失败：${response.data.code}`);
    }
    if (response.data.access_token) {
      activateEvent(EVENTS.REFRESH_ACCESS_TOKEN);
      cache.setStore(accessTokenKey, response.data.access_token);
      // 本地时间可能没有同步
      cache.setStore(accessTokenExpireKey, response.data.access_token_expire + Date.now());
      // 更新登录类型
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, response.data.login_type);
      return {
        accessToken: response.data.access_token,
        accessTokenExpire: response.data.access_token_expire
      };
    }
    // 匿名登录refresh_token过期情况下返回refresh_token
    // 此场景下使用新的refresh_token获取access_token
    if (response.data.refresh_token) {
      cache.removeStore(refreshTokenKey);
      cache.setStore(refreshTokenKey, response.data.refresh_token);
      this._refreshAccessToken();
    }
  }

  // 获取access token
  async getAccessToken(): Promise<GetAccessTokenResult> {
    const { accessTokenKey, accessTokenExpireKey } = cache.keys;
    // 如果没有access token或者过期，那么刷新
    let accessToken = cache.getStore(accessTokenKey);
    let accessTokenExpire = cache.getStore(accessTokenExpireKey);

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
    // const webDeviceId = await getTcbFingerprintId();
    const tmpObj = {
      action,
      // webDeviceId,
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
      }
    };
    if (options && options['onUploadProgress']) {
      opts.onUploadProgress = options['onUploadProgress'];
    }

    // 发出请求
    // 新的 url 需要携带 env 参数进行 CORS 校验
    // 请求链接支持添加动态 query 参数，方便用户调试定位请求
    const { parse, query, search } = params;
    let formatQuery: Record<string, any> = {
      env: this.config.env
    };
    // 尝试解析响应数据为 JSON
    parse && (formatQuery.parse = true);
    query && (formatQuery = {
      ...query,
      ...formatQuery
    });
    // 生成请求 url
    let newUrl = formatUrl(protocol, BASE_URL, formatQuery);

    if (search) {
      newUrl += search;
    }

    const res: any = await this.post({
      url: newUrl,
      data: payload,
      ...opts
    });

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

const request = new Request();

export { request, Request };
