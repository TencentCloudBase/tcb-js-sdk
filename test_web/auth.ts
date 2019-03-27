// auth
import * as assert from 'power-assert';
import { isSuccess } from './util';

export async function test_auth(app) {
  let auth = app.auth();
  let AllowedScopes = ['snsapi_base', 'snsapi_userinfo', 'snsapi_login'];
  let i;
  let scope;

  for (i = 0; i < AllowedScopes.length; i++) {
    scope = AllowedScopes[i];

    try {
      await auth.weixinAuthProvider({ scope: scope }).signIn((res) => {
        assert(isSuccess(res), {
          method: 'auth:signIn', returnType: 'callback', scope: scope, response: res
        });
      });
    } catch (e) {
    }

    try {
      await auth.weixinAuthProvider({ scope: scope }).signIn().then(function (res) {
        assert(isSuccess(res), {
          method: 'auth:signIn', returnType: 'promise', scope: scope, response: res
        });
      }).catch(function (err) {
        assert(false, {
          method: 'auth:signIn', returnType: 'promise', scope: scope, response: err
        });
      });
    } catch (e) {
    }

    try {
      await auth.getUserInfo().then(function (res) {
        assert(isSuccess(res), {
          method: 'auth:getUserInfo', returnType: 'promise', scope: scope, response: res
        });
      }).catch(function (err) {
        assert(false, {
          method: 'auth:getUserInfo', returnType: 'promise', scope: scope, response: err
        });
      });
    } catch (e) {
    }
  }
}