// test util
import * as assert from 'power-assert';

window['testCaseList'] = [];
let totalTestNum = 0;
let errorNum = 0;

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

  console.info('Test case finish: ', msg);
}

export async function runAllTestCases() {
  totalTestNum = window['testCaseList'].length;
  errorNum = 0;

  for (let i = 0; i < window['testCaseList'].length; i++) {
    await runSelectedTestCase(i);
  }
  console.log(`All test cases end, ${errorNum} errors in total ${totalTestNum} test cases.`);
}

export function isSuccess(err, res?) {
  return !(err !== 0 || err.code || err instanceof Error || (res && res.code));
}

export function catchCallback(e: Error) {
  if (e instanceof assert.AssertionError) {
    console.error('Test failed: ', e.message, e.stack);
  } else {
    console.error('Test failed: ', e);
  }
  errorNum++;
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