import { Config } from '../types';
import { LoginResult } from './interface';
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

  async signIn(): Promise<LoginResult> {
    let accessToken = this.cache.getStore(this.accessTokenKey);
    let accessTokenExpire = this.cache.getStore(this.accessTokenExpireKey);

    if (accessToken) {
      if (accessTokenExpire && accessTokenExpire > Date.now()) {
        // access存在且没有过期，那么直接返回
        return {
          credential: {
            accessToken,
            refreshToken: this.cache.getStore(this.refreshTokenKey)
          }
        };
      } else {
        // access token存在但是过期了，那么删除掉重新拉
        this.cache.removeStore(this.accessTokenKey);
        this.cache.removeStore(this.accessTokenExpireKey);
      }
    }
    if (Object.values(AllowedScopes).includes(AllowedScopes[this.scope]) === false) {
      throw new Error('错误的scope类型');
    }

    const code = util.getWeixinCode();

    // 没有code，拉起OAuth
    if (!code) {
      return this.redirect();
    }

    // 有code，用code换refresh token
    const loginType = this.scope === 'snsapi_login' ? 'WECHAT-OPEN' : 'WECHAT-PUBLIC';
    const { refreshToken } = await this.getRefreshTokenByWXCode(this.appid, loginType, code);

    // 本地存下
    this.cache.setStore(this.refreshTokenKey, refreshToken);

    return {
      credential: {
        refreshToken
      }
    };
  }

  redirect(): any {
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