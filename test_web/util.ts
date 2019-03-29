// test util
import * as assert from 'power-assert';
const testUnitList = [];

export function register(msg, fn: Function) {
  testUnitList.push({
    msg,
    fn
  });
}

export async function run() {
  for (let i = 0; i < testUnitList.length; i++) {
    let { msg, fn } = testUnitList[i];
    console.info('Testing: ', msg);

    await fn();
  }
}

export function isSuccess(err, res?) {
  let bool = false;
  if (arguments.length === 2) {
    bool = !(!err || err.code || err instanceof Error || res.code);
  } else if (arguments.length === 1) {
    bool = !(!err || err.code || err instanceof Error);
  }
  return bool;
}

export function catchCallback(e: Error) {
  if (e instanceof assert.AssertionError) {
    console.error('Test failed: ', e);
  } else {
    throw e;
  }
}

export function callbackWithTryCatch(callback: Function, finallyCallback?: Function) {
  return function () {
    try {
      callback.apply(this, arguments);
    } catch (e) {
      catchCallback(e);
    } finally {
      if (finallyCallback) {
        finallyCallback();
      }
    }
  };
}