import { Request } from '../lib/request';
import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { AuthProvider, LOGINTYPE } from './base';
import { addEventListener, activateEvent, EVENTS } from '../lib/events';
import { LoginResult } from './interface';
import { Config } from '../types';

// enum Persistence {
//   local = 'local',
//   session = 'session',
//   none = 'none'
// }

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
  httpRequest: Request;
  config: Config;
  customAuthProvider: AuthProvider
  _shouldRefreshAccessToken: Function
  _anonymousAuthProvider: AnonymousAuthProvider

  constructor(config: Config) {
    super(config);
    // this.httpRequest = new Request(config);
    this.config = config;
  }
  init() {
    super.init();
    this.customAuthProvider = new AuthProvider(this.config);
    this.customAuthProvider.init();
  }

  weixinAuthProvider({ appid, scope, loginMode, state }) {
    const provider =  new WeixinAuthProvider(this.config, appid, scope, loginMode, state);
    provider.init();
    return provider;
  }

  async signInAnonymously() {
    if (!this._anonymousAuthProvider) {
      this._anonymousAuthProvider = new AnonymousAuthProvider(this.config);
      this._anonymousAuthProvider.init();
    }
    addEventListener(EVENTS.LOGIN_TYPE_CHANGE, ev => {
      if (ev && ev.data === LOGINTYPE.ANONYMOUS) {
        const info = this._anonymousAuthProvider.getAllStore();
        for (const key in info) {
          info[key] && this.httpRequest.cache.setStore(key, info[key]);
        }
      }
    });
    const result = await this._anonymousAuthProvider.signIn();
    return result;
  }

  async linkAndRetrieveDataWithTicket(ticket: string) {
    if (!this._anonymousAuthProvider) {
      this._anonymousAuthProvider = new AnonymousAuthProvider(this.config);
      this._anonymousAuthProvider.init();
    }
    addEventListener(EVENTS.ANONYMOUS_CONVERTED, ev => {
      const { refresh_token } = ev.data;
      if (refresh_token) {
        this.httpRequest.cache.setStore(this.refreshTokenKey, refresh_token);
      }
    });
    const result = await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(ticket);
    return result;
  }

  async signOut() {
    if (this.loginType === LOGINTYPE.ANONYMOUS) {
      throw new Error('[tcb-js-sdk] 匿名用户不支持登出操作');
    }
    const { cache, refreshTokenKey, accessTokenKey, accessTokenExpireKey } = this.httpRequest;
    const action = 'auth.logout';

    const refresh_token = cache.getStore(refreshTokenKey);
    if (!refresh_token) {
      return;
    }
    const res = await this.httpRequest.send(action, { refresh_token });

    cache.removeStore(refreshTokenKey);
    cache.removeStore(accessTokenKey);
    cache.removeStore(accessTokenExpireKey);
    activateEvent(EVENTS.LOGIN_STATE_CHANGED);
    activateEvent(EVENTS.LOGIN_TYPE_CHANGE, LOGINTYPE.NULL);
    return res;
  }

  async getAccessToken() {
    return {
      accessToken: (await this.httpRequest.getAccessToken()).accessToken,
      env: this.config.env
    };
  }

  onLoginStateExpire(callback: Function) {
    addEventListener('loginStateExpire', callback);
  }

  async getLoginState(): Promise<LoginResult> {
    const { cache, refreshTokenKey, accessTokenKey } = this.httpRequest;
    const refreshToken = cache.getStore(refreshTokenKey);
    if (refreshToken) {
      try {
        await this.httpRequest.refreshAccessToken();
      } catch (e) {
        return null;
      }
      return {
        isAnonymous: this.loginType === LOGINTYPE.ANONYMOUS,
        credential: {
          refreshToken,
          accessToken: cache.getStore(accessTokenKey)
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
    const { cache, refreshTokenKey } = this.httpRequest;
    const res = await this.httpRequest.send('auth.signInWithTicket', {
      ticket,
      refresh_token: cache.getStore(refreshTokenKey) || ''
    });
    if (res.refresh_token) {
      this.customAuthProvider.setRefreshToken(res.refresh_token);
      await this.httpRequest.refreshAccessToken();
      activateEvent(EVENTS.LOGIN_STATE_CHANGED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGE, LOGINTYPE.CUSTOM);
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
    this.httpRequest._shouldRefreshAccessTokenHook = hook.bind(this);
  }

  getUserInfo(): any {
    const action = 'auth.getUserInfo';

    return this.httpRequest.send(action, {}).then(res => {
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
}
