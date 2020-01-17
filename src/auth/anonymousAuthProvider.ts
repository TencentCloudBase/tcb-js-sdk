import { AuthProvider, LOGINTYPE } from './base';
import { activateEvent, EVENTS } from '../lib/events';

export class AnonymousAuthProvider extends AuthProvider {
  public async signIn() {
    // 匿名登录前迁移cache到localstorage
    this._cache.updatePersistence('local');
    const { anonymousUuidKey, refreshTokenKey } = this._cache.keys;
    // 如果本地存有uuid则匿名登录时传给server
    const anonymous_uuid = this._cache.getStore(anonymousUuidKey) || undefined;
    // 此处cache为基类property
    const refresh_token = this._cache.getStore(refreshTokenKey) || undefined;
    const res = await this._request.send('auth.signInAnonymously', {
      anonymous_uuid,
      refresh_token
    });
    if (res.uuid && res.refresh_token) {
      this._setAnonymousUUID(res.uuid);
      this.setRefreshToken(res.refresh_token);
      await this._request.refreshAccessToken();
      activateEvent(EVENTS.LOGIN_STATE_CHANGED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, {
        env: this.config.env,
        loginType: LOGINTYPE.ANONYMOUS,
        persistence: 'local'
      });
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
    const { anonymousUuidKey, refreshTokenKey } = this._cache.keys;
    const uuid = this._cache.getStore(anonymousUuidKey);
    const refresh_token = this._cache.getStore(refreshTokenKey);
    const res = await this._request.send('auth.linkAndRetrieveDataWithTicket', {
      anonymous_uuid: uuid,
      refresh_token,
      ticket
    });
    if (res.refresh_token) {
      // 转正后清除本地保存的匿名uuid
      this._clearAnonymousUUID();
      this.setRefreshToken(res.refresh_token);
      await this._request.refreshAccessToken();
      activateEvent(EVENTS.ANONYMOUS_CONVERTED, { env: this.config.env });
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, { loginType: LOGINTYPE.CUSTOM, persistence: 'local' });
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
    const { anonymousUuidKey, loginTypeKey } = this._cache.keys;
    this._cache.removeStore(anonymousUuidKey);
    this._cache.setStore(anonymousUuidKey, id);
    this._cache.setStore(loginTypeKey, LOGINTYPE.ANONYMOUS);
  }
  private _clearAnonymousUUID() {
    this._cache.removeStore(this._cache.keys.anonymousUuidKey);
  }
}