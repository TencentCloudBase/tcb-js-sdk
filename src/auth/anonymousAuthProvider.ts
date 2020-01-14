import { AuthProvider, LOGINTYPE } from './base';
import { activateEvent, EVENTS } from '../lib/events';
import { cache } from '../lib/cache';
import { request } from '../lib/request';

export class AnonymousAuthProvider extends AuthProvider {
  public async signIn() {
    // 匿名登录前迁移cache到localstorage
    cache.updatePersistence('local');
    const { anonymousUuidKey, refreshTokenKey } = cache.keys;
    // 如果本地存有uuid则匿名登录时传给server
    const anonymous_uuid = cache.getStore(anonymousUuidKey) || undefined;
    // 此处cache为基类property
    const refresh_token = cache.getStore(refreshTokenKey) || undefined;
    const res = await request.send('auth.signInAnonymously', {
      anonymous_uuid,
      refresh_token
    });
    if (res.uuid && res.refresh_token) {
      this._setAnonymousUUID(res.uuid);
      this.setRefreshToken(res.refresh_token);
      await request.refreshAccessToken();
      activateEvent(EVENTS.LOGIN_STATE_CHANGED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, LOGINTYPE.ANONYMOUS);
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
    const { anonymousUuidKey, refreshTokenKey } = cache.keys;
    const uuid = cache.getStore(anonymousUuidKey);
    const refresh_token = cache.getStore(refreshTokenKey);
    const res = await request.send('auth.linkAndRetrieveDataWithTicket', {
      anonymous_uuid: uuid,
      refresh_token,
      ticket
    });
    if (res.refresh_token) {
      // 转正后清除本地保存的匿名uuid
      this._clearAnonymousUUID();
      this.setRefreshToken(res.refresh_token);
      await request.refreshAccessToken();
      activateEvent(EVENTS.ANONYMOUS_CONVERTED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, LOGINTYPE.CUSTOM);
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
    const { anonymousUuidKey, loginTypeKey } = cache.keys;
    cache.removeStore(anonymousUuidKey);
    cache.setStore(anonymousUuidKey, id);
    cache.setStore(loginTypeKey, LOGINTYPE.ANONYMOUS);
  }
  private _clearAnonymousUUID() {
    cache.removeStore(cache.keys.anonymousUuidKey);
  }
}