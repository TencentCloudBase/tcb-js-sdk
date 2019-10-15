import { Request } from '../lib/request';
import { Cache } from '../lib/cache';
import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_Expire,
  REFRESH_TOKEN,
  Config
} from '../types';

export default class {
  httpRequest: Request;
  cache: Cache;
  accessTokenKey: string;
  accessTokenExpireKey: string;
  refreshTokenKey: string;

  constructor(config: Config) {
    this.httpRequest = new Request(config);
    this.cache = new Cache(config.persistence);

    this.accessTokenKey = `${ACCESS_TOKEN}_${config.env}`;
    this.accessTokenExpireKey = `${ACCESS_TOKEN_Expire}_${config.env}`;
    this.refreshTokenKey = `${REFRESH_TOKEN}_${config.env}`;
  }

  setRefreshToken(refreshToken) {
    // refresh token设置前，先清掉 access token
    this.cache.removeStore(this.accessTokenKey);
    this.cache.removeStore(this.accessTokenExpireKey);
    this.cache.setStore(this.refreshTokenKey, refreshToken);
  }

  public async getRefreshTokenByWXCode(appid: string, loginType: string, code: string, hybridMiniapp: string = '0'): Promise<{ refreshToken: string; accessToken: string; accessTokenExpire: number }> {
    const action = 'auth.getJwt';
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
