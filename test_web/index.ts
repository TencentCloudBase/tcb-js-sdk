import { test_auth } from './auth';
import { test_function } from './function';
import { uploadFile, getTempFileURL, downloadFile, deleteFile, test_storage } from './storage';
import { test_database } from './database';

import { run } from './util';

import * as Tcb from '../src/index';


let tcb = Tcb.default;
let app;
let init = async function () {
  // 初始化
  app = tcb.init({
    //env: 'ianhu',
    env: 'web-test-jimmy-0cf5fa'
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

  await test_auth(app);

  await test_function(app);

  await test_storage(app);

  await test_database(app);

  run();
};

init();