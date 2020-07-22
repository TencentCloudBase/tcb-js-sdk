import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { LOGINTYPE } from './base';
import { ICache, getCache } from '../lib/cache';
import { IRequest, getRequestByEnvId } from '../lib/request';
import { addEventListener, activateEvent, EVENTS } from '../lib/events';
import { describeClassGetters } from '../lib/util';
import { LoginResult } from './interface';
import { Config } from '../types';
import { CustomAuthProvider } from './customAuthProvider';
import { EmailAuthProvider } from './emailAuthProvider';
import { UsernameAuthProvider } from './usernameAuthProvider';

// export interface UserInfo {
//   openid: string;
//   nickname?: string;
//   sex?: number;
//   province?: string;
//   city?: string;
//   country?: string;
//   headimgurl?: string;
//   privilege?: [string];
//   unionid?: string;
// }

export class Auth {
  private config: Config;
  private _cache: ICache
  private _request: IRequest;
  private _anonymousAuthProvider: AnonymousAuthProvider

  constructor(config: Config) {
    this.config = config;
    this._cache = getCache(config.env);
    this._request = getRequestByEnvId(config.env);
    this._onAnonymousConverted = this._onAnonymousConverted.bind(this);
    this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this);

    addEventListener(EVENTS.LOGIN_TYPE_CHANGED, this._onLoginTypeChanged);
  }

  get currentUser() {
    const loginState = this.hasLoginState();
    if (loginState) {
      return loginState.user || null;
    } else {
      return null;
    }
  }

  get loginType(): LOGINTYPE {
    return this._cache.getStore(this._cache.keys.loginTypeKey);
  }

  weixinAuthProvider({ appid, scope, state }) {
    return new WeixinAuthProvider(this.config, appid, scope, state);
  }

  anonymousAuthProvider() {
    return new AnonymousAuthProvider(this.config);
  }

  customAuthProvider() {
    return new CustomAuthProvider(this.config);
  }

  emailAuthProvider() {
    return new EmailAuthProvider(this.config);
  }

  usernameAuthProvider() {
    return new UsernameAuthProvider(this.config);
  }

  async signInAnonymously() {
    return new AnonymousAuthProvider(this.config).signIn();
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    return new EmailAuthProvider(this.config).signIn(email, password);
  }

  signInWithUsernameAndPassword(username: string, password: string) {
    return new UsernameAuthProvider(this.config).signIn(username, password);
  }

  async linkAndRetrieveDataWithTicket(ticket: string) {
    if (!this._anonymousAuthProvider) {
      this._anonymousAuthProvider = new AnonymousAuthProvider(this.config);
    }
    addEventListener(EVENTS.ANONYMOUS_CONVERTED, this._onAnonymousConverted);
    const result = await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(ticket);
    return result;
  }

  async signOut() {
    if (this.loginType === LOGINTYPE.ANONYMOUS) {
      throw new Error('[tcb-js-sdk] 匿名用户不支持登出操作');
    }
    const { refreshTokenKey, accessTokenKey, accessTokenExpireKey } = this._cache.keys;
    const action = 'auth.logout';

    const refresh_token = this._cache.getStore(refreshTokenKey);
    if (!refresh_token) {
      return;
    }
    const res = await this._request.send(action, { refresh_token });

    this._cache.removeStore(refreshTokenKey);
    this._cache.removeStore(accessTokenKey);
    this._cache.removeStore(accessTokenExpireKey);
    activateEvent(EVENTS.LOGIN_STATE_CHANGED);
    activateEvent(EVENTS.LOGIN_TYPE_CHANGED, {
      env: this.config.env,
      loginType: LOGINTYPE.NULL,
      persistence: this.config.persistence
    });
    return res;
  }

  async signUpWithEmailAndPassword(email, password) {
    return this._request.send('auth.signUpWithEmailAndPassword', {
      email, password
    });
  }

  async sendPasswordResetEmail(email) {
    return this._request.send('auth.sendPasswordResetEmail', {
      email
    });
  }

  onLoginStateChanged(callback: Function) {
    addEventListener(EVENTS.LOGIN_STATE_CHANGED, () => {
      const loginState = this.hasLoginState();
      callback.call(this, loginState);
    });
    // 立刻执行一次回调
    const loginState = this.hasLoginState();
    callback.call(this, loginState);
  }
  onLoginStateExpired(callback: Function) {
    addEventListener(EVENTS.LOGIN_STATE_EXPIRED, callback.bind(this));
  }
  onAccessTokenRefreshed(callback: Function) {
    addEventListener(EVENTS.ACCESS_TOKEN_REFRESHD, callback.bind(this));
  }
  onAnonymousConverted(callback: Function) {
    addEventListener(EVENTS.ANONYMOUS_CONVERTED, callback.bind(this));
  }
  onLoginTypeChanged(callback: Function) {
    addEventListener(EVENTS.LOGIN_TYPE_CHANGED, () => {
      const loginState = this.hasLoginState();
      callback.call(this, loginState);
    });
  }

  async getAccessToken() {
    return {
      accessToken: (await this._request.getAccessToken()).accessToken,
      env: this.config.env
    };
  }

  hasLoginState(): LoginState {
    const { refreshTokenKey } = this._cache.keys;
    const refreshToken = this._cache.getStore(refreshTokenKey);
    if (refreshToken) {
      return new LoginState(this.config.env);
    } else {
      return null;
    }
  }

  async isUsernameRegistered(username: string): Promise<boolean> {
    if (typeof username !== 'string') {
      throw new Error('username must be a string');
    }

    const { data } = await this._request.send('auth.isUsernameRegistered', {
      username
    });
    return data && data.isRegistered;
  }

  getLoginState() {
    return Promise.resolve(this.hasLoginState());
  }

  async signInWithTicket(ticket: string): Promise<LoginResult> {
    return new CustomAuthProvider(this.config).signIn(ticket);
  }

  shouldRefreshAccessToken(hook) {
    this._request._shouldRefreshAccessTokenHook = hook.bind(this);
  }

  getUserInfo(): any {
    const action = 'auth.getUserInfo';
    console.warn('Auth.getUserInfo() 将会在下个主版本下线，请使用 Auth.currentUser 来获取用户信息');
    return this._request.send(action, {}).then(res => {
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

  getAuthHeader() {
    const { refreshTokenKey, accessTokenKey } = this._cache.keys;
    const refreshToken = this._cache.getStore(refreshTokenKey);
    const accessToken = this._cache.getStore(accessTokenKey);
    return {
      'x-cloudbase-credentials': accessToken + '/@@/' + refreshToken
    };
  }

  private _onAnonymousConverted(ev) {
    const { env } = ev.data;
    if (env !== this.config.env) {
      return;
    }
    // 匿名转正后迁移cache
    this._cache.updatePersistence(this.config.persistence);
    // removeEventListener(EVENTS.ANONYMOUS_CONVERTED, this._onAnonymousConverted);
  }

  private _onLoginTypeChanged(ev) {
    const { loginType, persistence, env } = ev.data;
    if (env !== this.config.env) {
      return;
    }
    // 登录态转变后迁移cache，防止在匿名登录状态下cache混用
    this._cache.updatePersistence(persistence);
    this._cache.setStore(this._cache.keys.loginTypeKey, loginType);
  }
}

export class User {
  protected info: {
    [infoKey: string]: string;
  };
  private _cache: ICache;
  private _request: IRequest;
  private _envId: string;

  constructor(envId: string) {
    if (!envId) {
      throw new Error('envId is not defined');
    }
    this.info = {};
    this._envId = envId;
    this._cache = getCache(this._envId);
    this._request = getRequestByEnvId(this._envId);

    describeClassGetters(User)
      .forEach(infoKey => {
        this.info[infoKey] = this.getLocalUserInfo(infoKey);
      });
  }

  get uid(): string {
    return this.getLocalUserInfo('uid');
  }

  get loginType(): string {
    return this.getLocalUserInfo('loginType');
  }

  get openid(): string {
    return this.getLocalUserInfo('wxOpenId');
  }

  get wxOpenId(): string {
    return this.getLocalUserInfo('wxOpenId');
  }

  get wxPublicId(): string {
    return this.getLocalUserInfo('wxPublicId');
  }

  get unionId(): string {
    return this.getLocalUserInfo('wxUnionId');
  }

  get qqMiniOpenId(): string {
    return this.getLocalUserInfo('qqMiniOpenId');
  }

  get email(): string {
    return this.getLocalUserInfo('email');
  }

  get hasPassword(): boolean {
    return this.getLocalUserInfo('hasPassword');
  }

  get customUserId(): string {
    return this.getLocalUserInfo('customUserId');
  }

  get nickName(): string {
    return this.getLocalUserInfo('nickName');
  }

  get gender(): string {
    return this.getLocalUserInfo('gender');
  }

  get avatarUrl(): string {
    return this.getLocalUserInfo('avatarUrl');
  }

  get location() {
    const location = {
      country: this.getLocalUserInfo('country'),
      province: this.getLocalUserInfo('province'),
      city: this.getLocalUserInfo('city')
    };
    return location;
  }

  linkWithTicket(ticket: string) {
    if (typeof ticket !== 'string') {
      throw new Error('ticket must be string');
    }
    return this._request.send('auth.linkWithTicket', { ticket });
  }

  linkWithRedirect(provider) {
    provider.signInWithRedirect();
  }

  updatePassword(newPassword, oldPassword) {
    return this._request.send('auth.updatePassword', {
      oldPassword,
      newPassword
    });
  }

  updateEmail(newEmail) {
    return this._request.send('auth.updateEmail', {
      newEmail
    });
  }

  updateUsername(username: string) {
    if (typeof username !== 'string') {
      throw new Error('username must be a string');
    }

    return this._request.send('auth.updateUsername', {
      username
    });
  }

  async getLinkedUidList() {
    const { data } = await this._request.send('auth.getLinkedUidList', {});
    let hasPrimaryUid = false;
    const { users } = data;
    users.forEach(user => {
      if (user.wxOpenId && user.wxPublicId) {
        hasPrimaryUid = true;
      }
    });
    return {
      users,
      hasPrimaryUid
    };
  }

  setPrimaryUid(uid) {
    return this._request.send('auth.setPrimaryUid', { uid });
  }

  unlink(platform) {
    return this._request.send('auth.unlink', { platform });
  }

  async update(userInfo) {
    const { nickName, gender, avatarUrl, province, country, city } = userInfo;
    const { data: newUserInfo } = await this._request.send('auth.updateUserInfo', { nickName, gender, avatarUrl, province, country, city });
    this.setLocalUserInfo(newUserInfo);
  }

  async refresh() {
    const action = 'auth.getUserInfo';
    const { data: userInfo } = await this._request.send(action, {});
    this.setLocalUserInfo(userInfo);
    return userInfo;
  }

  private setLocalUserInfo(userInfo) {
    const { userInfoKey } = this._cache.keys;
    this._cache.setStore(userInfoKey, userInfo);
    this.info = userInfo;
  }

  private getLocalUserInfo(key) {
    const { userInfoKey } = this._cache.keys;
    const userInfo = this._cache.getStore(userInfoKey);
    return userInfo[key];
  }
}

export class LoginState {
  public credential;
  public user;
  private _cache: ICache;
  // private _request: IRequest;
  constructor(envId) {
    if (!envId) {
      throw new Error('envId is not defined');
    }
    this._cache = getCache(envId);
    // this._request = getRequestByEnvId(envId);

    const { refreshTokenKey, accessTokenKey, accessTokenExpireKey } = this._cache.keys;
    const refreshToken = this._cache.getStore(refreshTokenKey);
    const accessToken = this._cache.getStore(accessTokenKey);
    const accessTokenExpire = this._cache.getStore(accessTokenExpireKey);
    this.credential = {
      refreshToken,
      accessToken,
      accessTokenExpire
    };


    this.user = new User(envId);
  }

  get isAnonymousAuth() {
    return this.loginType === LOGINTYPE.ANONYMOUS;
  }

  get isCustomAuth() {
    return this.loginType === LOGINTYPE.CUSTOM;
  }

  get isWeixinAuth() {
    return this.loginType === LOGINTYPE.WECHAT || this.loginType === LOGINTYPE.WECHAT_OPEN || this.loginType === LOGINTYPE.WECHAT_PUBLIC;
  }

  get loginType() {
    return this._cache.getStore(this._cache.keys.loginTypeKey);
  }
}