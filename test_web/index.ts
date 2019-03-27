import { test_auth } from './auth';
import { test_function } from './function';
import { uploadFile, getTempFileURL, downloadFile, deleteFile } from './storage';
import { test_database } from './database';

import * as Tcb from '../src/index';

const testUnitList = [];

export function register(msg, fn) {
  testUnitList.push({
    msg,
    fn
  });
}

export async function run() {
  for (let i = 0; i < testUnitList.length; i++) {
    let { msg, fn } = testUnitList[i];
    console.log(msg);
    await fn();
  }
}

let tcb = Tcb.default;
let app;
let init = async function () {
  // 初始化
  app = tcb.init({
    appid: 'wxacfb81f2ced64e70',
    //env: 'ianhu',
    env: 'sdf3-1c45e7'
  });

  document.getElementById('uploadFile').onclick = function () {
    uploadFile(app);
  };
  document.getElementById('getTempFileURL').onclick = function () {
    getTempFileURL(app);
  };
  document.getElementById('downloadFile').onclick = function () {
    downloadFile(app);
  };
  document.getElementById('deleteFile').onclick = function () {
    deleteFile(app);
  };

  try {
    await test_auth(app);
  } catch (e) {
  }

  try {
    await test_function(app);
  } catch (e) {
  }

  try {
    await test_database(app);
  } catch (e) {
  }

  run();
};

init();