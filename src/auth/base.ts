import { request } from '../lib/request';
import { cache } from '../lib/cache';
import { EVENTS, addEventListener } from '../lib/events';
import { Config } from '../types';
import { RUNTIME, Adapter } from '../adapters';

export enum LOGINTYPE {
  ANONYMOUS = 'ANONYMOUS',
  WECHAT = 'WECHAT',
  CUSTOM = 'CUSTOM',
  NULL = 'NULL' // 保留字，代表未登录
}

export class AuthProvider {
  config: Config;

  private _loginType: LOGINTYPE = LOGINTYPE.NULL;

  constructor(config: Config) {
    this.config = config;
    this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this);
    addEventListener(EVENTS.LOGIN_TYPE_CHANGED, this._onLoginTypeChanged);
  }

  get loginType(): LOGINTYPE {
    return this._loginType;
  }

  setRefreshToken(refreshToken) {
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey } = cache.keys;
    // refresh token设置前，先清掉 access token
    cache.removeStore(accessTokenKey);
    cache.removeStore(accessTokenExpireKey);
    cache.setStore(refreshTokenKey, refreshToken);
  }

  public async getRefreshTokenByWXCode(appid: string, loginType: string, code: string): Promise<{ refreshToken: string; accessToken: string; accessTokenExpire: number }> {
    const action = 'auth.getJwt';
    const hybridMiniapp =  Adapter.runtime === RUNTIME.WX_MP ? '1' : '0';
    return request.send(action, { appid, loginType, code, hybridMiniapp }).then(res => {
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

  private _onLoginTypeChanged(ev: {data: LOGINTYPE}) {
    this._loginType = <LOGINTYPE>ev.data;
    // 登录态转变后迁移cache，防止在匿名登录状态下cache混用
    cache.updatePersistence(this.config.persistence);
    cache.setStore(cache.keys.loginTypeKey, this._loginType);
  }
}
