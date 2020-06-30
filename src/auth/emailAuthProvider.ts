import { AuthProvider, LOGINTYPE } from './base';
import { LoginResult } from './interface';
import { activateEvent, EVENTS } from '../lib/events';
import { LoginState } from './index';

export class EmailAuthProvider extends AuthProvider {
  async signIn(email: string, password: string): Promise<LoginResult> {
    if (typeof email !== 'string') {
      throw new Error('email must be a string');
    }
    const { refreshTokenKey } = this._cache.keys;
    const res = await this._request.send('auth.signIn', {
      loginType: 'EMAIL',
      email,
      password,
      refresh_token: this._cache.getStore(refreshTokenKey) || ''
    });
    const { refresh_token, access_token, access_token_expire } = res;
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
        loginType: LOGINTYPE.EMAIL,
        persistence: this.config.persistence
      });
      return new LoginState(this.config.env);
    } else if (res.code) {
      throw new Error(`[tcb-js-sdk] 邮箱登录失败: [${res.code}] ${res.message}`);
    } else {
      throw new Error('[tcb-js-sdk] 邮箱登录失败');
    }
  }

  async activate(token: string) {
    return this._request.send('auth.activateEndUserMail', {
      token
    });
  }

  async resetPasswordWithToken(token, newPassword) {
    return this._request.send('auth.resetPasswordWithToken', {
      token,
      newPassword
    });
  }
}