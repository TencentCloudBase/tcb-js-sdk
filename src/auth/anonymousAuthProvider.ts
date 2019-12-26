import Base, { LOGINTYPE } from './base';
import { activateEvent, EVENTS } from '../lib/events';
import { Config, ANONYMOUS_UUID, LOGIN_TYPE_KEY } from '../types';

export class AnonymousAuthProvider extends Base {
  private readonly _anonymousUuidKey: string;
  private readonly _loginTypeKey: string;

  constructor(config: Config) {
    super({
      ...config,
      // 匿名信息永久保存
      persistence: 'local'
    });
    this._anonymousUuidKey = `${ANONYMOUS_UUID}_${this.config.env}`;
    this._loginTypeKey = `${LOGIN_TYPE_KEY}_${this.config.env}`;
  }
  public init() {
    super.init();
  }
  public async signIn() {
    // 如果本地存有uuid则匿名登录时传给server
    const anonymous_uuid = this.cache.getStore(this._anonymousUuidKey) || undefined;
    // 此处cache为基类property
    const refresh_token = this.cache.getStore(this.refreshTokenKey) || undefined;
    const res = await this.httpRequest.send('auth.signInAnonymously', {
      anonymous_uuid,
      refresh_token
    });
    if (res.uuid && res.refresh_token) {
      this._setAnonymousUUID(res.uuid);
      this.setRefreshToken(res.refresh_token);
      await this.httpRequest.refreshAccessToken();
      activateEvent(EVENTS.LOGIN_STATE_CHANGED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGE, LOGINTYPE.ANONYMOUS);
      return {
        credential: {
          refreshToken: res.refresh_token
        }
      };
    } else {
      throw new Error('[tcb-js-sdk] 匿名登录失败');
    }
  }
  public async linkAndRetrieveDataWithTicket(ticket: string) {
    const uuid = this.cache.getStore(this._anonymousUuidKey);
    const refresh_token = this.cache.getStore(this.refreshTokenKey);
    const res = await this.httpRequest.send('auth.linkAndRetrieveDataWithTicket', {
      anonymous_uuid: uuid,
      refresh_token,
      ticket
    });
    if (res.refresh_token) {
      // 转正后清除本地保存的匿名uuid
      this._clearAnonymousUUID();
      this.setRefreshToken(res.refresh_token);
      await this.httpRequest.refreshAccessToken();
      activateEvent(EVENTS.ANONYMOUS_CONVERTED, { refresh_token: res.refresh_token });
      activateEvent(EVENTS.LOGIN_TYPE_CHANGE, LOGINTYPE.CUSTOM);
      return {
        credential: {
          refreshToken: res.refresh_token
        }
      };
    } else {
      throw new Error('[tcb-js-sdk] 匿名转化失败');
    }
  }
  private _setAnonymousUUID(id: string) {
    this.cache.removeStore(this._anonymousUuidKey);
    this.cache.setStore(this._anonymousUuidKey, id);
    this.cache.setStore(this._loginTypeKey, LOGINTYPE.ANONYMOUS);
  }
  private _clearAnonymousUUID() {
    this.cache.removeStore(this._anonymousUuidKey);
  }
}