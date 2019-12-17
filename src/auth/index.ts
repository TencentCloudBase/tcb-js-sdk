import { Request } from '../lib/request';
import WeixinAuthProvider from './weixinAuthProvider';
import AuthProvider from './base';
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

export default class Auth extends AuthProvider {
  httpRequest: Request;
  config: Config;
  customAuthProvider: AuthProvider
  _shouldRefreshAccessToken: Function

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

  async signOut() {
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
