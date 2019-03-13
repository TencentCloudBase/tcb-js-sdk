import { JWT_KEY, Config } from '../types';
import * as util from '../lib/util';
import Base from './base';
import { createPromiseCallback } from '../lib/util';

/* eslint-disable no-unused-vars */
enum AllowedScopes {
  snsapi_base = 'snsapi_base',
  snsapi_userinfo = 'snsapi_userinfo',
  snsapi_login = 'snsapi_login',
}

enum LoginTypes {
  redirect = 'redirect',
  prompt = 'prompt'
}

export default class extends Base {
  config: Config;

  private scope: string;
  private state: string;
  private loginType: string;

  constructor(config: Config, scope: string, loginType?: string, state?: string) {
    super(config);

    this.config = config;
    this.scope = scope;
    this.state = state || 'weixin';
    this.loginType = loginType || 'redirect';
  }

  signIn(callback?: any) {
    callback = callback || createPromiseCallback();

    let jwt = this.cache.getStore(JWT_KEY);
    let code = util.getQuery('code');

    if (jwt || code) {
      let promise: Promise<any> = Promise.resolve();

      if (this.config.traceUser) {
        promise = this.traceUser();
      } else if (!jwt) {
        promise = this.getJwt();
      }

      promise.then(res => {
        callback(0);
        if (!jwt && res.token) {
          this.cache.setStore(JWT_KEY, res.token, 7000 * 1000);
        }
        if (!res || res.code) {
          throw new Error('登录失败，请用户重试');
        }
      });

      return callback.promise;
    }

    if (Object.values(AllowedScopes).includes(AllowedScopes[this.scope]) === false) {
      throw new Error('错误的scope类型');
    }

    let currUrl = util.removeParam('code', location.href);
    currUrl = util.removeParam('state', currUrl);
    currUrl = encodeURIComponent(currUrl);

    if (LoginTypes[this.loginType] === 'redirect') {
      location.href = `//open.weixin.qq.com/connect/oauth2/authorize?appid=${this.config.appid}&redirect_uri=${currUrl}&response_type=code&scope=${this.scope}&state=${this.state}#wechat_redirect`;
    }
  }
}