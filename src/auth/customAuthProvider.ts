import { AuthProvider, LOGINTYPE } from './base';
import { LoginResult } from './interface';
import { activateEvent, EVENTS } from '../lib/events';


export class CustomAuthProvider extends AuthProvider {
  async signIn(ticket: string): Promise<LoginResult> {
    if (typeof ticket !== 'string') {
      throw new Error('ticket must be a string');
    }
    const { refreshTokenKey } = this._cache.keys;
    const res = await this._request.send('auth.signInWithTicket', {
      ticket,
      refresh_token: this._cache.getStore(refreshTokenKey) || ''
    });
    if (res.refresh_token) {
      this.setRefreshToken(res.refresh_token);
      await this._request.refreshAccessToken();
      activateEvent(EVENTS.LOGIN_STATE_CHANGED);
      activateEvent(EVENTS.LOGIN_TYPE_CHANGED, {
        env: this.config.env,
        loginType: LOGINTYPE.CUSTOM,
        persistence: this.config.persistence
      });
      return {
        credential: {
          refreshToken: res.refresh_token
        }
      };
    } else {
      throw new Error('[tcb-js-sdk] 自定义登录失败');
    }
  }
}