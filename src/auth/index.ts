import { Request } from '../lib/request';
import { Config } from '../types';
import WeixinAuthProvider from './weixinAuthProvider';

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