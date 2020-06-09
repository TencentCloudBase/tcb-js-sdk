import {
  Config,
  BASE_URL,
  SDK_VERISON,
  KV,
  protocol,
  dataVersion
} from '../types';
import {
  IRequestOptions,
  SDKRequestInterface,
  ResponseObject,
  IUploadRequestOptions,
  IRequestConfig
} from '@cloudbase/adapter-interface';
import { ICache, getCache, getLocalCache } from './cache';
import { activateEvent, EVENTS } from './events';
import { genSeqId, isFormData, formatUrl, createSign } from './util';
import { Adapter, RUNTIME } from '../adapters';
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
  'auth.signInAnonymously',
  'auth.signIn',
  'auth.fetchAccessTokenWithRefreshToken'
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
 * @class IRequest
 */
class IRequest {
  config: Config;
  _shouldRefreshAccessTokenHook: Function
  _refreshAccessTokenPromise: Promise<GetAccessTokenResult> | null
  _reqClass: SDKRequestInterface;

  private _cache: ICache;
  // 持久化本地存储
  private _localCache: ICache;
  /**
   * 初始化
   * @param config
   */
  constructor(config: Config = {}) {
    this.config = config;
    // eslint-disable-next-line
    this._reqClass = new Adapter.adapter.reqClass(<IRequestConfig>{
      timeout: this.config.timeout,
      timeoutMsg: `[tcb-js-sdk] 请求在${this.config.timeout / 1000}s内未完成，已中断`,
      restrictedMethods: ['post']
    });
    this._cache = getCache(this.config.env);
    this._localCache = getLocalCache(this.config.env);
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
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey, loginTypeKey, anonymousUuidKey } = this._cache.keys;
    this._cache.removeStore(accessTokenKey);
    this._cache.removeStore(accessTokenExpireKey);

    let refreshToken = this._cache.getStore(refreshTokenKey);
    if (!refreshToken) {
      throw new Error('[tcb-js-sdk] 未登录CloudBase');
    }
    const params: KV<string> = {
      refresh_token: refreshToken,
    };
    const response = await this.request('auth.fetchAccessTokenWithRefreshToken', params);
    if (response.data.code) {
      const { code } = response.data;
      if (code === 'SIGN_PARAM_INVALID' || code === 'REFRESH_TOKEN_EXPIRED' || code === 'INVALID_REFRESH_TOKEN') {
        // 这里处理以下逻辑：
        // 匿名登录时，如果刷新access token报错refresh token过期，此时应该：
        // 1. 再用 uuid 拿一次新的refresh token
        // 2. 拿新的refresh token换access token
        const isAnonymous = this._cache.getStore(loginTypeKey) === LOGINTYPE.ANONYMOUS;
        if (isAnonymous && code === 'INVALID_REFRESH_TOKEN') {
          // 获取新的 refresh token
          const anonymous_uuid = this._cache.getStore(anonymousUuidKey);
          // 此处cache为基类property
          const refresh_token = this._cache.getStore(refreshTokenKey);
          const res = await this.send('auth.signInAnonymously', {
            anonymous_uuid,
            refresh_token
          });
          this.setRefreshToken(res.refresh_token);
          return this._refreshAccessToken();
        }
        activateEvent(EVENTS.LOGIN_STATE_EXPIRED);
        this._cache.removeStore(refreshTokenKey);
      }
      throw new Error(`[tcb-js-sdk] 刷新access token失败：${response.data.code}`);
    }
    if (response.data.access_token) {
      activateEvent(EVENTS.ACCESS_TOKEN_REFRESHD);
      this._cache.setStore(accessTokenKey, response.data.access_token);
      // 本地时间可能没有同步
      this._cache.setStore(accessTokenExpireKey, response.data.access_token_expire + Date.now());
      return {
        accessToken: response.data.access_token,
        accessTokenExpire: response.data.access_token_expire
      };
    }
    // 匿名登录refresh_token过期情况下返回refresh_token
    // 此场景下使用新的refresh_token获取access_token
    if (response.data.refresh_token) {
      this._cache.removeStore(refreshTokenKey);
      this._cache.setStore(refreshTokenKey, response.data.refresh_token);
      this._refreshAccessToken();
    }
  }

  // 获取access token
  async getAccessToken(): Promise<GetAccessTokenResult> {
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey } = this._cache.keys;
    const refreshToken = this._cache.getStore(refreshTokenKey);
    if (!refreshToken) {
      // 不该出现的状态：有 access token 却没有 refresh token
      throw new Error('[tcb-js-sdk] refresh token不存在，登录状态异常');
    }
    // 如果没有access token或者过期，那么刷新
    let accessToken = this._cache.getStore(accessTokenKey);
    let accessTokenExpire = this._cache.getStore(accessTokenExpireKey);

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

  /* eslint-disable complexity */
  async request(action, params, options?) {
    const tcbTraceKey = `x-tcb-trace_${this.config.env}`;
    let contentType = 'application/x-www-form-urlencoded';
    // const webDeviceId = await getTcbFingerprintId();
    const tmpObj = {
      action,
      // webDeviceId,
      dataVersion,
      env: this.config.env,
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
      payload = {};
      for (let key in tmpObj) {
        if (tmpObj[key] !== undefined) {
          payload[key] = tmpObj[key];
        }
      }
    }
    // 非web平台使用凭证检验有效性
    if (Adapter.runtime !== RUNTIME.WEB) {
      const { appSign, appSecret } = this.config;
      const timestamp = Date.now();
      const { appAccessKey, appAccessKeyId } = appSecret;
      const sign = createSign({
        data: payload,
        timestamp,
        appAccessKeyId,
        appSign
      }, appAccessKey);

      payload = {
        ...payload,
        timestamp,
        appAccessKey,
        appSign,
        sign
      };
    }
    let opts: any = {
      headers: {
        'content-type': contentType
      }
    };
    if (options && options['onUploadProgress']) {
      opts.onUploadProgress = options['onUploadProgress'];
    }

    const traceHeader = this._localCache.getStore(tcbTraceKey);
    if (traceHeader) {
      opts.headers['X-TCB-Trace'] = traceHeader;
    }

    // 发出请求
    // 新的 url 需要携带 env 参数进行 CORS 校验
    // 请求链接支持添加动态 query 参数，方便用户调试定位请求
    const { parse, inQuery, search } = params;
    let formatQuery: Record<string, any> = {
      env: this.config.env
    };
    // 尝试解析响应数据为 JSON
    parse && (formatQuery.parse = true);
    inQuery && (formatQuery = {
      ...inQuery,
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

    // 保存 trace header
    const resTraceHeader = res.header && res.header['x-tcb-trace'];
    if (resTraceHeader) {
      this._localCache.setStore(tcbTraceKey, resTraceHeader);
    }

    if ((Number(res.status) !== 200 && Number(res.statusCode) !== 200) || !res.data) {
      throw new Error('network request error');
    }

    return res;
  }

  async send(action: string, data: any = {}): Promise<any> {
    const response = await this.request(action, data, { onUploadProgress: data.onUploadProgress });
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

  private setRefreshToken(refreshToken) {
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey } = this._cache.keys;
    // refresh token设置前，先清掉 access token
    this._cache.removeStore(accessTokenKey);
    this._cache.removeStore(accessTokenExpireKey);
    this._cache.setStore(refreshTokenKey, refreshToken);
  }
}

const requestMap: KV<IRequest> = {};

function initRequest(config: Config) {
  requestMap[config.env] = new IRequest(config);
}

function getRequestByEnvId(env: string): IRequest {
  return requestMap[env];
}

export { getRequestByEnvId, IRequest, initRequest };