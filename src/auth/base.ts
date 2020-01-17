import { IRequest, getRequestByEnvId } from '../lib/request';
import { ICache, getCache } from '../lib/cache';
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

  protected readonly _cache: ICache;
  protected readonly _request: IRequest;

  constructor(config: Config) {
    this.config = config;
    this._cache = getCache(config.env);
    this._request = getRequestByEnvId(config.env);
  }

  setRefreshToken(refreshToken) {
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey } = this._cache.keys;
    // refresh token设置前，先清掉 access token
    this._cache.removeStore(accessTokenKey);
    this._cache.removeStore(accessTokenExpireKey);
    this._cache.setStore(refreshTokenKey, refreshToken);
  }

  public async getRefreshTokenByWXCode(appid: string, loginType: string, code: string): Promise<{ refreshToken: string; accessToken: string; accessTokenExpire: number }> {
    const action = 'auth.getJwt';
    const hybridMiniapp = Adapter.runtime === RUNTIME.WX_MP ? '1' : '0';
    return this._request.send(action, { appid, loginType, code, hybridMiniapp }).then(res => {
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