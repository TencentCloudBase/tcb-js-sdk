// auth
import * as assert from 'power-assert';
import { register, callbackWithTryCatch, isSuccess } from './util';

function registerAuthTest(app, appid, scope) {
  let auth = app.auth();

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