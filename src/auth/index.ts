import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { LOGINTYPE } from './base';
import { ICache, getCache } from '../lib/cache';
import { IRequest, getRequestByEnvId } from '../lib/request';
import { addEventListener, activateEvent, EVENTS } from '../lib/events';
import { LoginResult } from './interface';
import { Config } from '../types';
import { CustomAuthProvider } from './customAuthProvider';

export interface UserInfo {
  openid: string;
  nickname?: string;
  sex?: number;
  province?: string;
  city?: string;
  country?: string;
  headimgurl?: string;
  privilege?: [string];
  unionid?: string;
}

export class Auth {
  private config: Config;
  private _cache: ICache
  private _request: IRequest;
  private _anonymousAuthProvider: AnonymousAuthProvider

  constructor(config: Config) {
    this.config = config;
    this._cache = getCache(config.env);
    this._request = getRequestByEnvId(config.env);
    this._onAnonymousConverted = this._onAnonymousConverted.bind(this);
    this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this);

    addEventListener(EVENTS.LOGIN_TYPE_CHANGED, this._onLoginTypeChanged);
  }

  get loginType(): LOGINTYPE {
    return this._cache.getStore(this._cache.keys.loginTypeKey);
  }

  weixinAuthProvider({ appid, scope, state }) {
    return new WeixinAuthProvider(this.config, appid, scope, state);
  }

  anonymousAuthProvider() {
    return new AnonymousAuthProvider(this.config);
  }

  customAuthProvider() {
    return new CustomAuthProvider(this.config);
  }

  async signInAnonymously() {
    return new AnonymousAuthProvider(this.config).signIn();
  }

  async linkAndRetrieveDataWithTicket(ticket: string) {
    if (!this._anonymousAuthProvider) {
      this._anonymousAuthProvider = new AnonymousAuthProvider(this.config);
    }
    addEventListener(EVENTS.ANONYMOUS_CONVERTED, this._onAnonymousConverted);
    const result = await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(ticket);
    return result;
  }

  async signOut() {
    if (this.loginType === LOGINTYPE.ANONYMOUS) {
      throw new Error('[tcb-js-sdk] 匿名用户不支持登出操作');
    }
    const { refreshTokenKey, accessTokenKey, accessTokenExpireKey } = this._cache.keys;
    const action = 'auth.logout';

    const refresh_token = this._cache.getStore(refreshTokenKey);
    if (!refresh_token) {
      return;
    }
    const res = await this._request.send(action, { refresh_token });

    this._cache.removeStore(refreshTokenKey);
    this._cache.removeStore(accessTokenKey);
    this._cache.removeStore(accessTokenExpireKey);
    activateEvent(EVENTS.LOGIN_STATE_CHANGED);
    activateEvent(EVENTS.LOGIN_TYPE_CHANGED, {
      env: this.config.env,
      loginType: LOGINTYPE.NULL,
      persistence: this.config.persistence
    });
    return res;
  }

  onLoginStateChanged(callback) {
    addEventListener(EVENTS.LOGIN_STATE_CHANGED, callback);
  }
  onLoginStateExpired(callback) {
    addEventListener(EVENTS.LOGIN_STATE_EXPIRED, callback);
  }
  onAccessTokenRefreshed(callback) {
    addEventListener(EVENTS.ACCESS_TOKEN_REFRESHD, callback);
  }
  onAnonymousConverted(callback) {
    addEventListener(EVENTS.ANONYMOUS_CONVERTED, callback);
  }
  onLoginTypeChanged(callback) {
    addEventListener(EVENTS.LOGIN_TYPE_CHANGED, callback);
  }

  async getAccessToken() {
    return {
      accessToken: (await this._request.getAccessToken()).accessToken,
      env: this.config.env
    };
  }

  getLoginState(): LoginResult {
    const { refreshTokenKey, accessTokenKey, accessTokenExpireKey } = this._cache.keys;
    const refreshToken = this._cache.getStore(refreshTokenKey);
    const accessToken = this._cache.getStore(accessTokenKey);
    const accessTokenExpire = this._cache.getStore(accessTokenExpireKey);
    if (accessToken && accessTokenExpire > new Date().getTime()) {
      return {
        isAnonymous: this.loginType === LOGINTYPE.ANONYMOUS,
        credential: {
          refreshToken,
          accessToken: this._cache.getStore(accessTokenKey)
        }
      };
    } else {
      return null;
    }
  }

  async signInWithTicket(ticket: string): Promise<LoginResult> {
    return new CustomAuthProvider(this.config).signIn(ticket);
  }

  shouldRefreshAccessToken(hook) {
    this._request._shouldRefreshAccessTokenHook = hook.bind(this);
  }

  getUserInfo(): any {
    const action = 'auth.getUserInfo';

    return this._request.send(action, {}).then(res => {
      if (res.code) {
        return res;
      } else {
        return {
          ...res.data,
          requestId: res.seqId
        };
      }
    });
  }

  getAuthHeader() {
    const { refreshTokenKey, accessTokenKey } = this._cache.keys;
    const refreshToken = this._cache.getStore(refreshTokenKey);
    const accessToken = this._cache.getStore(accessTokenKey);
    return {
      'x-cloudbase-credentials': accessToken + '/@@/' + refreshToken
    };
  }

  private _onAnonymousConverted(ev) {
    const { env } = ev.data;
    if (env !== this.config.env) {
      return;
    }
    // 匿名转正后迁移cache
    this._cache.updatePersistence(this.config.persistence);
    // removeEventListener(EVENTS.ANONYMOUS_CONVERTED, this._onAnonymousConverted);
  }

  private _onLoginTypeChanged(ev) {
    const { loginType, persistence, env } = ev.data;
    if (env !== this.config.env) {
      return;
    }
    // 登录态转变后迁移cache，防止在匿名登录状态下cache混用
    this._cache.updatePersistence(persistence);
    this._cache.setStore(this._cache.keys.loginTypeKey, loginType);
  }
}
