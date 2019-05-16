import { test_auth } from './auth';
import { test_function } from './function';
import { uploadFile, getTempFileURL, downloadFile, deleteFile, test_storage } from './storage';
import { test_database } from './database';
import { runAllTestCases, runSelectedTestCase } from './util';

import '../src/index';

let tcb = window['tcb'];
let app;
let appid;
let init = async function () {
  // 初始化
  app = tcb.init({
    //env: 'ianhu',
    // env: 'jimmytest-088bef'
    // env: 'webtestjimmy-5328c3'
    env: 'feature-env-billing-004'
    // env: 'web-test-jimmy-0cf5fa' //体验
  });
  // appid = 'wxacfb81f2ced64e70';
  appid = 'wxf4cf4a6bfa6320fb'

  await test_auth(app, appid);

  await test_storage(app);

  await test_function(app);

  await test_database(app);

  app.auth().onLoginStateExpire(() => {
    console.log('LoginStateExpire....')
  })
};

window['initStorage'] = function () {
  document.getElementById('uploadFile').onclick = function () {
    let returnTypeEle = <HTMLSelectElement>document.getElementById('returnType');
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value;
    uploadFile(app, returnType);
  };
  document.getElementById('getTempFileURL').onclick = function () {
    let returnTypeEle = <HTMLSelectElement>document.getElementById('returnType');
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value;
    getTempFileURL(app, returnType);
  };
  document.getElementById('downloadFile').onclick = function () {
    downloadFile(app);
  };
  document.getElementById('deleteFile').onclick = function () {
    let returnTypeEle = <HTMLSelectElement>document.getElementById('returnType');
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value;
    deleteFile(app, returnType);
  };
};

window['initIndex'] = function () {
  document.getElementById('runSelectedTestCase').onclick = function () {
    let selectEle = <HTMLSelectElement>document.getElementById('testCaseSelect');
    let selectIndex = selectEle.options[selectEle.selectedIndex].value;
    runSelectedTestCase(Number(selectIndex));
  };
  /*document.getElementById('runSelectedTestCaseType').onclick = function() {
    let selectEle = <HTMLSelectElement>document.getElementById('testCaseTypeSelect');
    let selectIndex = selectEle.options[selectEle.selectedIndex].value;
    runSelectedTestCase(Number(selectIndex));
  };*/
  document.getElementById('runAllTestCases').onclick = function () {
    runAllTestCases();
  };

  let selectEle = <HTMLSelectElement>document.getElementById('testCaseSelect');
  let htmlStr = '';
  window['testCaseList'].forEach(({ msg }, index) => {
    htmlStr += `<option value="${index}">${msg}</option>`;
  });
  selectEle.innerHTML = htmlStr;
};

init();