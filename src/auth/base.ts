import { Request } from '../lib/request';
import { Cache } from '../lib/cache';
import { EVENTS, addEventListener } from '../lib/events';
import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_Expire,
  REFRESH_TOKEN,
  Config,
  LOGIN_TYPE_KEY
} from '../types';
import { RUNTIME, Adapter } from '../adapters';

export enum LOGINTYPE {
  ANONYMOUS = 'ANONYMOUS',
  WECHAT = 'WECHAT',
  CUSTOM = 'CUSTOM',
  NULL = 'NULL' // 保留字，代表未登录
}

export class AuthProvider {
  httpRequest: Request;
  cache: Cache;
  accessTokenKey: string;
  accessTokenExpireKey: string;
  refreshTokenKey: string;
  loginTypeKey: string;
  config: Config;

  private _loginType: LOGINTYPE = LOGINTYPE.NULL;

  constructor(config: Config) {
    this.config = config;
    this.onLoginTypeChanged = this.onLoginTypeChanged.bind(this);
    addEventListener(EVENTS.LOGIN_TYPE_CHANGE, this.onLoginTypeChanged);
  }

  init() {
    this.httpRequest = new Request(this.config);
    this.cache = new Cache(this.config.persistence);

    this.accessTokenKey = `${ACCESS_TOKEN}_${this.config.env}`;
    this.accessTokenExpireKey = `${ACCESS_TOKEN_Expire}_${this.config.env}`;
    this.refreshTokenKey = `${REFRESH_TOKEN}_${this.config.env}`;
    this.loginTypeKey = `${LOGIN_TYPE_KEY}_${this.config.env}`;
  }

  onLoginTypeChanged(ev: {data: LOGINTYPE}) {
    this._loginType = <LOGINTYPE>ev.data;
    this.cache.setStore(this.loginTypeKey, this._loginType);
  }

  get loginType(): LOGINTYPE {
    return this._loginType;
  }

  setRefreshToken(refreshToken) {
    // refresh token设置前，先清掉 access token
    this.cache.removeStore(this.accessTokenKey);
    this.cache.removeStore(this.accessTokenExpireKey);
    this.cache.setStore(this.refreshTokenKey, refreshToken);
  }

  public async getRefreshTokenByWXCode(appid: string, loginType: string, code: string): Promise<{ refreshToken: string; accessToken: string; accessTokenExpire: number }> {
    const action = 'auth.getJwt';
    const hybridMiniapp =  Adapter.runtime === RUNTIME.WX_MP ? '1' : '0';
    return this.httpRequest.send(action, { appid, loginType, code, hybridMiniapp }).then(res => {
      if (res.code) {
        throw new Error(`[tcb-js-sdk] 微信登录失败: ${res.code}`);
      }
      if (res.refresh_token) {
        return {
          refreshToken: res.refresh_token,
          accessToken: res.access_token,
          accessTokenExpire: res.access_token_expire
        };
      } else {
        throw new Error(`[tcb-js-sdk] getJwt未返回refreshToken`);
      }
    });
  }
}
