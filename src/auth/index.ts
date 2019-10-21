import { Request } from '../lib/request';
import WeixinAuthProvider from './weixinAuthProvider';
import AuthProvider from './base';
import { addEventListener } from '../lib/events';
import { LoginResult } from './interface';
import {
  Config
} from '../types';

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
    this.customAuthProvider = new AuthProvider(this.config);
  }

  weixinAuthProvider({ appid, scope, loginMode, state }) {
    return new WeixinAuthProvider(this.config, appid, scope, loginMode, state);
  }

  async signOut() {
    const { cache, refreshTokenKey, accessTokenKey, accessTokenExpireKey } = this.httpRequest;
    const action = 'auth.logout';
    await this.httpRequest.send(action, { refresh_token: cache.getStore(refreshTokenKey) });

    cache.removeStore(refreshTokenKey);
    cache.removeStore(accessTokenKey);
    cache.removeStore(accessTokenExpireKey);
    return;
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

  async getLoginState(): Promise<LoginResult | undefined> {
    const { cache, refreshTokenKey, accessTokenKey } = this.httpRequest;
    const refreshToken = cache.getStore(refreshTokenKey);
    if (refreshToken) {
      try {
        await this.httpRequest.refreshAccessToken();
      } catch (e) {
        return;
      }
      return {
        credential: {
          refreshToken,
          accessToken: cache.getStore(accessTokenKey)
        }
      };
    } else {
      return;
    }
  }

  async signInWithTicket(ticket: string): Promise<LoginResult> {
    if (typeof ticket !== 'string') {
      throw new Error('ticket must be a string');
    }
    const res = await this.httpRequest.send('auth.signInWithTicket', {
      ticket
    });
    if (res.refresh_token) {
      this.customAuthProvider.setRefreshToken(res.refresh_token);
      await this.httpRequest.refreshAccessToken();
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
