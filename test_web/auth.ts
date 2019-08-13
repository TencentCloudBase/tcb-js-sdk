// auth
import * as assert from 'power-assert';
import { register, callbackWithTryCatch, isSuccess } from './util';

function registerAuthTest(app, appid, scope) {
  let auth = app.auth({
    persistence: 'local'
  });

  register('auth: signIn in callback, scope: ' + scope, async () => {
    await new Promise((resolve) => {
      auth.weixinAuthProvider({ appid, scope }).signIn(callbackWithTryCatch((err, res) => {
        assert(isSuccess(err, res), { err, res });
      }, () => {
        resolve();
      }));
    });
  });

  register('auth: signIn in promise, scope: ' + scope, async () => {
    await auth.weixinAuthProvider({ appid, scope }).signIn().then(callbackWithTryCatch((res) => {
      assert(isSuccess(0, res), { res });
    })).catch(callbackWithTryCatch((err) => {
      assert(false, { err });
    }));
  });

  register('auth: getUserInfo, scope: ' + scope, async () => {
    await auth.getUserInfo().then(callbackWithTryCatch((res) => {
      assert(isSuccess(0, res) && res.appid, { res });
    })).catch(callbackWithTryCatch((err) => {
      assert(false, { err });
    }));
  });

  register('auth: signOut, scope: ' + scope, async () => {
    await auth.signOut().then(callbackWithTryCatch((res) => {
      assert(isSuccess(0, res) && res.appid, { res });
    })).catch(callbackWithTryCatch((err) => {
      assert(false, { err });
    }));
  });

  register('auth: signIn with ticket', async () => {
    await auth.signInWithTicket('f91e0a64-c293-47d4-8bf7-f9b76a7e200f/@@/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJSUzI1NiIsImVudiI6InRlc3QtZTQ4ZmUxIiwiaWF0IjoxNTYyODMwOTU3ODMxLCJleHAiOjE1NjI4MzA5NTg0MzEsInVpZCI6Im95ZWp1MEVvYzFaQ0VneXhmazJ2TmVZRE1wUnMiLCJyZWZyZXNoIjozNjAwLCJleHBpcmUiOjE1NjI4MzE1NjI2MzF9.JKwT7IjjKMOxpelUlXRz795ajMhLGOVjDEQUZy2iW0qw0Ki57LvYeMls6euQpiqBRCEIT5IOzKEULAniE3BzczISXWMc9Nn0ai4sR1FTqeilI1C1cv1_KZuBZ8579MnLTxNvQYnExjvsSFMlwhVcQFkIFwgf9ijcBgSoW5tf4y0');
  });
}

export function test_auth(app, appid: string) {
  let AllowedScopes = ['snsapi_base', 'snsapi_userinfo', 'snsapi_login'];
  let i;
  let scope;

  for (i = 0; i < AllowedScopes.length; i++) {
    scope = AllowedScopes[i];

    registerAuthTest(app, appid, scope);
  }
}