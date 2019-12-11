import * as url from 'url';
import {
  Config,
  RequestMode,
  BASE_URL,
  ACCESS_TOKEN,
  ACCESS_TOKEN_Expire,
  REFRESH_TOKEN,
  SDK_VERISON,
  KV
} from '../types';
import { Cache } from './cache';
import { activateEvent, EVENTS } from './events';
import { adapter } from '../adapters';
import { IRequestOptions } from '../adapters/types';
import { genSeqId, isFormData } from './util';

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
  'auth.signInWithTicket'
];

const commonHeader = {
  'X-SDK-Version': SDK_VERISON
};

/**
 * @class RequestMethods
 */
class RequestMethods extends adapter.reqClass {
  constructor() {
    super();
    RequestMethods.bindHooks(this, 'post', [RequestMethods.beforeEach]);
    RequestMethods.bindHooks(this, 'upload', [RequestMethods.beforeEach]);
    RequestMethods.bindHooks(this, 'download', [RequestMethods.beforeEach]);
  }
  /**
   * 绑定hooks
   * @static
   */
  static bindHooks(instance: RequestMethods, name: string, hooks: RequestBeforeHook[]) {
    const originMethod = instance[name];
    instance[name] = function(options: IRequestOptions) {
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
  /**
   * 每次请求之前执行，追加data和headers
   * @static
   */
  static beforeEach(): AppendedRequestInfo {
    const seqId = genSeqId();
    return {
      data: {
        seqId
      },
      headers: commonHeader
    };
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
 * @class Request
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
   * @param config
   */
  constructor(config: Config = DEFAULT_REQUEST_CONFIG) {
    super();
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
        activateEvent(EVENTS.LOGIN_STATE_EXPIRE);
        this.cache.removeStore(this.refreshTokenKey);
      }
      throw new Error(`[tcb-js-sdk] 刷新access token失败：${response.data.code}`);
    }
    if (response.data.access_token) {
      activateEvent(EVENTS.REFRESH_ACCESS_TOKEN);
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
    let newUrl = url.format({
      pathname: BASE_URL,
      query: formatQuery
    });

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

export { Request };
