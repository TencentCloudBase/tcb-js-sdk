import { Request } from '../lib/request';
import { Cache } from '../lib/cache';
import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_Expire,
  REFRESH_TOKEN,
  Config
} from '../types';
import { activateEvent } from '../lib/events';

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
    this.cache.setStore(this.refreshTokenKey, refreshToken);
  }

  public getJwt(appid?: string, loginType?: string, code?: string): any {
    const action = 'auth.getJwt';

    let self = this;
    return this.httpRequest.send(action, { appid, loginType, code }).then(res => {
      if (res.access_token) {
        self.cache.setStore(self.accessTokenKey, res.access_token);
        // 本地时间可能没有同步
        self.cache.setStore(
          self.accessTokenExpireKey,
          res.access_token_expire + Date.now()
        );
      }
      if (res.refresh_token) {
        self.cache.setStore(self.refreshTokenKey, res.refresh_token);
      }
      if (res.code === 'CHECK_LOGIN_FAILED') {
        self.cache.removeStore(self.accessTokenKey);
        self.cache.removeStore(self.accessTokenExpireKey);
        // access_token过期，刷新access_token
        return self.getJwt(appid, loginType);
      }
      if (res.code === 'REFRESH_TOKEN_EXPIRED') {
        self.cache.removeStore(self.refreshTokenKey);
        self.cache.removeStore(self.accessTokenKey);
        self.cache.removeStore(self.accessTokenExpireKey);
        activateEvent('LoginStateExpire');
        return res;
      }
      return res;
    });
  }
}
