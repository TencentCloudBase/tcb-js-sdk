import { Request } from '../lib/request';
import WeixinAuthProvider from './weixinAuthProvider';

import { Cache } from '../lib/cache';
import { JWT_KEY, Config } from '../types';

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

export default class Auth {
  httpRequest: Request;
  config: Config;

  constructor(config: Config) {
    this.httpRequest = new Request(config);
    this.config = config;
  }

  weixinAuthProvider({ appid, scope, loginMode, state }) {
    return new WeixinAuthProvider(this.config, appid, scope, loginMode, state);
  }

  signOut() {
    let cache = new Cache(this.config.persistence);
    cache.removeStore(`${JWT_KEY}_${this.config.env}`);
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