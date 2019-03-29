import { test_auth } from './auth';
import { test_function } from './function';
import { uploadFile, getTempFileURL, downloadFile, deleteFile } from './storage';
import { test_database } from './database';

import { run } from './util';

import * as Tcb from '../src/index';


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