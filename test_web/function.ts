// function
import * as assert from 'power-assert';
import { register, callbackWithTryCatch, isSuccess } from './util';

export function test_function(app) {
  register('callFunction in callback', async () => {
    await new Promise(resolve => {
      app.callFunction({ name: 'test', data: { hello: 'world' }}, callbackWithTryCatch((err, res) => {
        assert(isSuccess(err, res), {
          err,
          res
        });
      }, () => {
        resolve();
      }));
    });
  });

  register('callFunction in promise', async () => {
    await app.callFunction({ name: 'test', data: { hello: 'world' }}).then(callbackWithTryCatch((res) => {
      assert(isSuccess(res), { res });
    })).catch(callbackWithTryCatch((err) => {
      assert(false, { err });
    }));
  });
}