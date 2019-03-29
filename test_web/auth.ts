// auth
import * as assert from 'power-assert';
import { register, callbackWithTryCatch, isSuccess } from './util';

function registerAuthTest(app, scope) {
  let auth = app.auth();

  register('signIn in callback, scope: ' + scope, async () => {
    await new Promise((resolve) => {
      auth.weixinAuthProvider({ scope: scope }).signIn(callbackWithTryCatch((err, res) => {
        assert(isSuccess(err, res), { err, res });
      }, () => {
        resolve();
      }));
    });
  });

  register('signIn in promise, scope: ' + scope, async () => {
    await auth.weixinAuthProvider({ scope: scope }).signIn().then(callbackWithTryCatch((res) => {
      assert(isSuccess(res), { res });
    })).catch(callbackWithTryCatch((err) => {
      assert(false, { err });
    }));
  });

  register('getUserInfo, scope: ' + scope, async () => {
    await auth.getUserInfo().then(callbackWithTryCatch((res) => {
      assert(isSuccess(res), { res });
    })).catch(callbackWithTryCatch((err) => {
      assert(false, { err });
    }));
  });
}

export function test_auth(app) {
  let AllowedScopes = ['snsapi_base', 'snsapi_userinfo', 'snsapi_login'];
  let i;
  let scope;

  for (i = 0; i < AllowedScopes.length; i++) {
    scope = AllowedScopes[i];

    registerAuthTest(app, scope);
  }
}