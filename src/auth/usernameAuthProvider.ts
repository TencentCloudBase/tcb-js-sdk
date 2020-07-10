import { AuthProvider, LOGINTYPE } from './base';
import { LoginResult } from './interface';
import { activateEvent, EVENTS } from '../lib/events';
import { LoginState } from './index';

export class UsernameAuthProvider extends AuthProvider {
  async signIn(username: string, password: string): Promise<LoginResult> {
    if (typeof username !== 'string') {
      throw new Error('username must be a string');
    }
    // 用户不设置密码
    if (typeof password !== 'string') {
      password = '';
      console.warn('password is empty');
    }

    const { refreshTokenKey } = this._cache.keys;
    const res = await this._request.send(
      'auth.signIn',
      {
        loginType: LOGINTYPE.USERNAME,
        username,
        password,
        refresh_token: this._cache.getStore(refreshTokenKey) || ''
      }
    );

    const { refresh_token, access_token_expire, access_token } = res;
    if (refresh_token) {
      this.setRefreshToken(refresh_token);
      if (access_token && access_token_expire) {
        this.setAccessToken(access_token, access_token_expire);
      } else {
        await this._request.refreshAccessToken();
      }
      // set user info
      await this.refreshUserInfo();
      activateEvent(EVENTS.LOGIN_STATE_CHANGED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, {
        env: this.config.env,
        loginType: LOGINTYPE.USERNAME,
        persistence: this.config.persistence
      });
      return new LoginState(this.config.env);
    } else if (res.code) {
      throw new Error(`[tcb-js-sdk] 用户名密码登录失败: [${res.code}] ${res.message}`);
    } else {
      throw new Error(`[tcb-js-sdk] 用户名密码登录失败`);
    }
  }
}
