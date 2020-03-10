import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { AuthProvider, LOGINTYPE } from './base';
import { addEventListener, activateEvent, EVENTS } from '../lib/events';
import { LoginResult } from './interface';
import { Config } from '../types';

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

export class Auth extends AuthProvider {
  config: Config;
  customAuthProvider: AuthProvider
  _shouldRefreshAccessToken: Function
  _anonymousAuthProvider: AnonymousAuthProvider

  constructor(config: Config) {
    super(config);
    this.config = config;
    this.customAuthProvider = new AuthProvider(this.config);
    this._onAnonymousConverted = this._onAnonymousConverted.bind(this);
    this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this);

    addEventListener(EVENTS.LOGIN_TYPE_CHANGED, this._onLoginTypeChanged);
  }

  get loginType(): LOGINTYPE {
    return this._cache.getStore(this._cache.keys.loginTypeKey);
  }

  weixinAuthProvider({ appid, scope, loginMode, state }) {
    return new WeixinAuthProvider(this.config, appid, scope, loginMode, state);
  }

  async signInAnonymously() {
    if (!this._anonymousAuthProvider) {
      this._anonymousAuthProvider = new AnonymousAuthProvider(this.config);
    }
    const result = await this._anonymousAuthProvider.signIn();
    return result;
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

  async getAccessToken() {
    return {
      accessToken: (await this._request.getAccessToken()).accessToken,
      env: this.config.env
    };
  }

  onLoginStateExpire(callback: Function) {
    addEventListener('loginStateExpire', callback);
  }

  async getLoginState(): Promise<LoginResult> {
    const { refreshTokenKey, accessTokenKey } = this._cache.keys;
    const refreshToken = this._cache.getStore(refreshTokenKey);
    if (refreshToken) {
      try {
        await this._request.refreshAccessToken();
      } catch (e) {
        return null;
      }
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
    if (typeof ticket !== 'string') {
      throw new Error('ticket must be a string');
    }
    const { refreshTokenKey } = this._cache.keys;
    const res = await this._request.send('auth.signInWithTicket', {
      ticket,
      refresh_token: this._cache.getStore(refreshTokenKey) || ''
    });
    if (res.refresh_token) {
      this.customAuthProvider.setRefreshToken(res.refresh_token);
      await this._request.refreshAccessToken();
      activateEvent(EVENTS.LOGIN_STATE_CHANGED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, {
        env: this.config.env,
        loginType: LOGINTYPE.CUSTOM,
        persistence: this.config.persistence
      });
      return {
        credential: {
          refreshToken: res.refresh_token
        }
      };
    } else {
      throw new Error('[tcb-js-sdk] 自定义登录失败');
    }
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

  // setAuthCookie() {
  //   const { env } = this.config;
  //   const { refreshTokenKey, accessTokenKey } = this._cache.keys;
  //   const refreshToken = this._cache.getStore(refreshTokenKey);
  //   const accessToken = this._cache.getStore(accessTokenKey);
  //   return this._request.post({
  //     url: `https://cookie.${env}.service.tcloudbase.com`,
  //     headers: {
  //       'content-type': 'application/x-www-form-urlencoded'
  //     },
  //     withCredentials: true,
  //     data: {
  //       credentials: accessToken + '/@@/' + refreshToken
  //     }
  //   });
  // }

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
