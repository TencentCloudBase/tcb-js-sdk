// function
import * as assert from 'power-assert';
import { isSuccess } from './util';

export async function test_function(app) {
  await app.callFunction({ name: 'test', data: { hello: 'world' }}, function (err, res) {
    assert(isSuccess(err, res), {
      method: 'function:callFunction', returnType: 'callback', response: {
        err,
        res
      }
    });
  });

  await app.callFunction({ name: 'test', data: { hello: 'world' }}).then(function (res) {
    assert(isSuccess(res), {
      method: 'function:callFunction', returnType: 'promise', response: res
    });
  }).catch(function (err) {
    assert(false, {
      method: 'function:callFunction', returnType: 'promise', response: err
    });
  });
}