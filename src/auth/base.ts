import { IRequest, getRequestByEnvId } from '../lib/request';
import { ICache, getCache } from '../lib/cache';
import { Config } from '../types';

export enum LOGINTYPE {
  ANONYMOUS = 'ANONYMOUS',
  WECHAT = 'WECHAT',
  WECHAT_PUBLIC = 'WECHAT-PUBLIC',
  WECHAT_OPEN = 'WECHAT-OPEN',
  CUSTOM = 'CUSTOM',
  EMAIL = 'EMAIL',
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

  protected setRefreshToken(refreshToken) {
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey } = this._cache.keys;
    // refresh token设置前，先清掉 access token
    this._cache.removeStore(accessTokenKey);
    this._cache.removeStore(accessTokenExpireKey);
    this._cache.setStore(refreshTokenKey, refreshToken);
  }

  protected setAccessToken(accessToken, accessTokenExpire) {
    const { accessTokenKey, accessTokenExpireKey } = this._cache.keys;
    this._cache.setStore(accessTokenKey, accessToken);
    this._cache.setStore(accessTokenExpireKey, accessTokenExpire);
  }

  protected async refreshUserInfo() {
    const action = 'auth.getUserInfo';
    const { data: userInfo } = await this._request.send(action, {});
    this.setLocalUserInfo(userInfo);
    return userInfo;
  }

  protected setLocalUserInfo(userInfo) {
    const { userInfoKey } = this._cache.keys;
    this._cache.setStore(userInfoKey, userInfo);
  }
}