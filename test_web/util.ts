// test util
import * as assert from 'power-assert';

window['testCaseList'] = [];
let totalTestNum = 0;
let failedTestNum = 0;

export function register(msg, fn: Function) {
  window['testCaseList'].push({
    msg,
    fn
  });
}

export async function runSelectedTestCase(i: number) {
  let { msg, fn } = window['testCaseList'][i];
  console.info('Testing: ', msg);

  await fn();
}

export async function runAllTestCases() {
  totalTestNum = window['testCaseList'].length;
  failedTestNum = 0;

  for (let i = 0; i < window['testCaseList'].length; i++) {
    await runSelectedTestCase(i);
  }

  console.log(`Test end, ${failedTestNum} assertion(s) failed in total ${totalTestNum} tests.`);
}

export function isSuccess(err, res?) {
  let bool = false;
  if (arguments.length === 2) {
    bool = !(err !== 0 || err.code || err instanceof Error || res.code);
  } else if (arguments.length === 1) {
    bool = !(err !== 0 || err.code || err instanceof Error);
  }
  return bool;
}

export function catchCallback(e: Error) {
  if (e instanceof assert.AssertionError) {
    console.error('Test failed: ', e.message);
    failedTestNum++;
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