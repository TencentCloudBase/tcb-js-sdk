import { Config } from '../types';
import * as util from '../lib/util';
import Base from './base';

/* eslint-disable no-unused-vars */
enum AllowedScopes {
  snsapi_base = 'snsapi_base',
  snsapi_userinfo = 'snsapi_userinfo',
  snsapi_login = 'snsapi_login',
}

enum LoginModes {
  redirect = 'redirect',
  prompt = 'prompt'
}

export default class extends Base {
  config: Config;

  private scope: string;
  private state: string;
  private loginMode: string;
  private appid: string;

  constructor(config: Config, appid: string, scope: string, loginMode?: string, state?: string) {
    super(config);

    this.config = config;
    this.appid = appid;
    this.scope = scope;
    this.state = state || 'weixin';
    this.loginMode = loginMode || 'redirect';
  }

  signIn(callback?: any) {
    callback = callback || util.createPromiseCallback();

    let jwt = this.cache.getStore(this.localKey);
    let code = util.getQuery('code');

    if (jwt) {
      callback(0);
      return callback.promise;
    }

    if (code) {
      const loginType = this.scope === 'snsapi_login' ? 'WECHAT-OPEN' : 'WECHAT-PUBLIC';
      let promise: Promise<any> = this.getJwt(this.appid, loginType);

      let self = this;
      promise.then(res => {
        if (!res || res.code) {
          self.redirect();
        } else {
          callback(0, res);
        }
      });

      return callback.promise;
    }

    if (Object.values(AllowedScopes).includes(AllowedScopes[this.scope]) === false) {
      throw new Error('错误的scope类型');
    }

    this.redirect();
  }

  redirect() {
    let currUrl = util.removeParam('code', location.href);
    currUrl = util.removeParam('state', currUrl);
    currUrl = encodeURIComponent(currUrl);

    let host = '//open.weixin.qq.com/connect/oauth2/authorize';
    if (this.scope === 'snsapi_login') {
      host = '//open.weixin.qq.com/connect/qrconnect';
    }

    if (LoginModes[this.loginMode] === 'redirect') {
      location.href = `${host}?appid=${this.appid}&redirect_uri=${currUrl}&response_type=code&scope=${this.scope}&state=${this.state}#wechat_redirect`;
    }
  }
}