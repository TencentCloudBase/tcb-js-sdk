import { test_function } from './function';
import {
  uploadFile,
  getTempFileURL,
  downloadFile,
  deleteFile,
  test_storage
} from './storage';
import { test_database } from './database';
import { runAllTestCases, runSelectedTestCase } from './util';
import tcb from '../dist/index';
// import tcb from '../src';
// import { test_ext_ci } from './ext_ci';
// 默认情况下不测试登录
// import {  testUsernameAuthOpen } from './auth';

// import * as extCi from '@cloudbase/extension-ci';

let app;
// const appid = 'wxacfb81f2ced64e70';

let init = async function() {
  console.log('web test starting init');
  // 初始化
  app = tcb.init({
    // env: 'jimmytest-088bef',
    // env: 'base-dev-c9ff99'
    // env: 'webtestjimmy-5328c3',
    // env: 'dev-97eb6c'
    // env: 'postpay-a870cf'
    // env: 'hosting-a13d0a',
    // env: 'test-2a63aa'
    // env: 'feature-env-billing-004'
    env: 'dev-withnate-a76f76',

    // 账号密码登录云环境
    // env: 'peter2005271641', // @明明 @董沅鑫 未在控制台开通账号密码登录
    // env: 'devchs-02-1549b5', // @陈实 @董沅鑫 已在控制台开通账号密码登录

    timeout: 150000
    // env: 'luke-3de127'
  });

  // await test_ext_ci(app);

  // storage 有需要手动上传文件的测试用例，无法自动跑完
  await test_storage(app);

  await test_function(app);

  await test_database(app);

  // app.auth().onLoginStateExpire(() => {
  //   console.log("LoginStateExpire....");
  // });
};

window['initStorage'] = function() {
  document.getElementById('uploadFile').onclick = function() {
    let returnTypeEle = <HTMLSelectElement>(
      document.getElementById('returnType')
    );
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value;
    uploadFile(app, returnType);
  };
  document.getElementById('getTempFileURL').onclick = function() {
    let returnTypeEle = <HTMLSelectElement>(
      document.getElementById('returnType')
    );
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value;
    getTempFileURL(app, returnType);
  };
  document.getElementById('downloadFile').onclick = function() {
    downloadFile(app);
  };
  document.getElementById('deleteFile').onclick = function() {
    let returnTypeEle = <HTMLSelectElement>(
      document.getElementById('returnType')
    );
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value;
    deleteFile(app, returnType);
  };
};

window['initIndex'] = function() {
  document.getElementById('runSelectedTestCase').onclick = function() {
    let selectEle = <HTMLSelectElement>(
      document.getElementById('testCaseSelect')
    );
    let selectIndex = selectEle.options[selectEle.selectedIndex].value;
    runSelectedTestCase(Number(selectIndex));
  };
  /*document.getElementById('runSelectedTestCaseType').onclick = function() {
    let selectEle = <HTMLSelectElement>document.getElementById('testCaseTypeSelect');
    let selectIndex = selectEle.options[selectEle.selectedIndex].value;
    runSelectedTestCase(Number(selectIndex));
  };*/
  document.getElementById('runAllTestCases').onclick = function() {
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
