import { Config } from '../types';
import { LoginResult } from './interface';
import * as util from '../lib/util';
import { AuthProvider, LOGINTYPE } from './base';
import { activateEvent, EVENTS } from '../lib/events';
import { Adapter, RUNTIME } from '../adapters';


/* eslint-disable no-unused-vars */
enum AllowedScopes {
  // 公众平台-base
  snsapi_base = 'snsapi_base',
  // 公众平台-userinfo
  snsapi_userinfo = 'snsapi_userinfo',
  // 开放平台-login
  snsapi_login = 'snsapi_login'
}

const SignInPromiseMap = {};

export class WeixinAuthProvider extends AuthProvider {
  config: Config;

  private scope: string;
  private state: string;
  private appid: string;

  constructor(config: Config, appid: string, scope: string, state?: string) {
    super(config);

    this.config = config;
    this.appid = appid;
    this.scope = Adapter.runtime === RUNTIME.WX_MP ? 'snsapi_base' : scope;
    this.state = state || 'weixin';
  }

  async signInWithRedirect() {
    return this.redirect();
  }

  async getRedirectResult() {
    const code = util.getWeixinCode();
    if (!code) {
      return null;
    }
    return this._signInWithCode(code);
  }

  async signIn(): Promise<LoginResult> {
    if (!SignInPromiseMap[this.config.env]) {
      SignInPromiseMap[this.config.env] = this._signIn();
    }
    let result;
    let err;
    try {
      result = await SignInPromiseMap[this.config.env];
    } catch (e) {
      err = e;
    }
    SignInPromiseMap[this.config.env] = null;
    if (err) {
      throw err;
    }
    return result;
  }

  private async _signIn(): Promise<LoginResult> {
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey } = this._cache.keys;
    let accessToken = this._cache.getStore(accessTokenKey);
    let accessTokenExpire = this._cache.getStore(accessTokenExpireKey);

    if (accessToken) {
      if (accessTokenExpire && accessTokenExpire > Date.now()) {
        // access存在且没有过期，那么直接返回
        return {
          credential: {
            accessToken,
            refreshToken: this._cache.getStore(refreshTokenKey)
          }
        };
      } else {
        // access token存在但是过期了，那么删除掉重新拉
        this._cache.removeStore(accessTokenKey);
        this._cache.removeStore(accessTokenExpireKey);
      }
    }
    if (!AllowedScopes[this.scope]) {
      throw new Error('错误的scope类型');
    }

    let code;
    if (Adapter.runtime === RUNTIME.WX_MP) {
      code = await util.getMiniAppCode();
    } else {
      code = util.getWeixinCode();
      // 没有code，拉起OAuth
      if (!code) {
        return this.redirect();
      }
    }

    return this._signInWithCode(code);

  }

  private redirect(): any {
    let currUrl = util.removeParam('code', location.href);
    currUrl = util.removeParam('state', currUrl);
    currUrl = encodeURIComponent(currUrl);

    let host = '//open.weixin.qq.com/connect/oauth2/authorize';
    if (this.scope === 'snsapi_login') {
      host = '//open.weixin.qq.com/connect/qrconnect';
    }
    location.href = `${host}?appid=${this.appid}&redirect_uri=${currUrl}&response_type=code&scope=${this.scope}&state=${this.state}#wechat_redirect`;
  }

  private async _signInWithCode(code) {
    const { accessTokenKey, accessTokenExpireKey, refreshTokenKey } = this._cache.keys;
    // 有code，用code换refresh token
    const loginType = (scope => {
      switch (scope) {
        case AllowedScopes.snsapi_login:
          return 'WECHAT-OPEN';
        default:
          return 'WECHAT-PUBLIC';
      }
    })(this.scope);

    const refreshTokenRes = await this.getRefreshTokenByWXCode(this.appid, loginType, code);
    const { refreshToken } = refreshTokenRes;

    // 本地存下
    this._cache.setStore(refreshTokenKey, refreshToken);
    if (refreshTokenRes.accessToken) {
      this._cache.setStore(accessTokenKey, refreshTokenRes.accessToken);
    }
    if (refreshTokenRes.accessTokenExpire) {
      this._cache.setStore(accessTokenExpireKey, refreshTokenRes.accessTokenExpire + Date.now());
    }
    activateEvent(EVENTS.LOGIN_STATE_CHANGED);
    // 抛出登录类型更改事件
    activateEvent(EVENTS.LOGIN_TYPE_CHANGED, { loginType: LOGINTYPE.WECHAT, persistence: this.config.persistence });
    return {
      credential: {
        refreshToken
      }
    };
  }

  private async getRefreshTokenByWXCode(appid: string, loginType: string, code: string): Promise<{ refreshToken: string; accessToken: string; accessTokenExpire: number }> {
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