import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { AuthProvider, LOGINTYPE } from './base';
import { addEventListener, activateEvent, EVENTS } from '../lib/events';
import { LoginResult } from './interface';
import { Config } from '../types';
import { cache } from '../lib/cache';
import { request } from '../lib/request';

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
  config: Config;
  customAuthProvider: AuthProvider
  _shouldRefreshAccessToken: Function
  _anonymousAuthProvider: AnonymousAuthProvider

  constructor(config: Config) {
    super(config);
    this.config = config;
    this._onAnonymousConverted = this._onAnonymousConverted.bind(this);
    this.customAuthProvider = new AuthProvider(this.config);
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
    const { refreshTokenKey, accessTokenKey, accessTokenExpireKey } = cache.keys;
    const action = 'auth.logout';

    const refresh_token = cache.getStore(refreshTokenKey);
    if (!refresh_token) {
      return;
    }
    const res = await request.send(action, { refresh_token });

    cache.removeStore(refreshTokenKey);
    cache.removeStore(accessTokenKey);
    cache.removeStore(accessTokenExpireKey);
    activateEvent(EVENTS.LOGIN_STATE_CHANGED);
    activateEvent(EVENTS.LOGIN_TYPE_CHANGED, LOGINTYPE.NULL);
    return res;
  }

  async getAccessToken() {
    return {
      accessToken: (await request.getAccessToken()).accessToken,
      env: this.config.env
    };
  }

  onLoginStateExpire(callback: Function) {
    addEventListener('loginStateExpire', callback);
  }

  async getLoginState(): Promise<LoginResult> {
    const { refreshTokenKey, accessTokenKey } = cache.keys;
    const refreshToken = cache.getStore(refreshTokenKey);
    if (refreshToken) {
      try {
        await request.refreshAccessToken();
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
    const { refreshTokenKey } = cache.keys;
    const res = await request.send('auth.signInWithTicket', {
      ticket,
      refresh_token: cache.getStore(refreshTokenKey) || ''
    });
    if (res.refresh_token) {
      this.customAuthProvider.setRefreshToken(res.refresh_token);
      await request.refreshAccessToken();
      activateEvent(EVENTS.LOGIN_STATE_CHANGED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, LOGINTYPE.CUSTOM);
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
    request._shouldRefreshAccessTokenHook = hook.bind(this);
  }

  getUserInfo(): any {
    const action = 'auth.getUserInfo';

    return request.send(action, {}).then(res => {
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

  private _onAnonymousConverted() {
    // 匿名转正后迁移cache
    cache.updatePersistence(this.config.persistence);
    removeEventListener(EVENTS.ANONYMOUS_CONVERTED, this._onAnonymousConverted);
  }
}
