import { test_auth } from "./auth"
// import { test_function } from "./function";
import {
  uploadFile,
  getTempFileURL,
  downloadFile,
  deleteFile
  // test_storage
} from "./storage"
import { test_database } from "./database"
import { runAllTestCases, runSelectedTestCase } from "./util"

import "../src/index"

let tcb = window["tcb"]
let app
let appid
let init = async function() {
  console.log("web test**************")
  // 初始化
  app = tcb.init({
    //env: 'ianhu',
    // env: 'jimmytest-088bef'
    // env: 'webtestjimmy-5328c3'
    // env: 'feature-env-billing-004'
    // env: "dev-withnate-604e29"
    env: "web-test-jimmy-0cf5fa" //体验
  })
  appid = "wxacfb81f2ced64e70"
  // appid = 'wxf4cf4a6bfa6320fb'

  await test_auth(app, appid)

  // let auth = app.auth({
  //   persistence: "local"
  // });
  // await auth
  //   .weixinAuthProvider({
  //     appid: appid,
  //     scope: "snsapi_base"
  //   })
  //   .signIn(function() {});

  // const db = app.database()
  // const _ = db.command

  // const collName = "coll-1"
  // const collection = db.collection(collName)

  // // 监听1
  // collection.where({ test: _.gt(0) }).watch({
  //   onChange: snapshot => {
  //     console.log("收到snapshot**********", snapshot)
  //   },
  //   onError: error => {
  //     console.log("收到error**********", error)
  //   }
  // })

  // // 监听2
  // collection.where({ test: _.gt(1) }).watch({
  //   onChange: snapshot => {
  //     console.log("收到snapshot1**********", snapshot)
  //   },
  //   onError: error => {
  //     console.log("收到error1**********", error)
  //   }
  // })

  // // mock add doc
  // document.getElementById("mockAddDoc").onclick = async function() {
  //   // mock新增数据
  //   let res = await collection.add({ test: 2 })
  //   console.log("add res**********", res)
  // }
  // await test_storage(app);

  // await test_function(app);

  await test_database(app)

  // app.auth().onLoginStateExpire(() => {
  //   console.log("LoginStateExpire....");
  // });
}

window["initStorage"] = function() {
  document.getElementById("uploadFile").onclick = function() {
    let returnTypeEle = <HTMLSelectElement>document.getElementById("returnType")
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value
    uploadFile(app, returnType)
  }
  document.getElementById("getTempFileURL").onclick = function() {
    let returnTypeEle = <HTMLSelectElement>document.getElementById("returnType")
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value
    getTempFileURL(app, returnType)
  }
  document.getElementById("downloadFile").onclick = function() {
    downloadFile(app)
  }
  document.getElementById("deleteFile").onclick = function() {
    let returnTypeEle = <HTMLSelectElement>document.getElementById("returnType")
    let returnType = returnTypeEle.options[returnTypeEle.selectedIndex].value
    deleteFile(app, returnType)
  }
}

window["initIndex"] = function() {
  document.getElementById("runSelectedTestCase").onclick = function() {
    let selectEle = <HTMLSelectElement>document.getElementById("testCaseSelect")
    let selectIndex = selectEle.options[selectEle.selectedIndex].value
    runSelectedTestCase(Number(selectIndex))
  }
  /*document.getElementById('runSelectedTestCaseType').onclick = function() {
    let selectEle = <HTMLSelectElement>document.getElementById('testCaseTypeSelect');
    let selectIndex = selectEle.options[selectEle.selectedIndex].value;
    runSelectedTestCase(Number(selectIndex));
  };*/
  document.getElementById("runAllTestCases").onclick = function() {
    runAllTestCases()
  }

  let selectEle = <HTMLSelectElement>document.getElementById("testCaseSelect")
  let htmlStr = ""
  window["testCaseList"].forEach(({ msg }, index) => {
    htmlStr += `<option value="${index}">${msg}</option>`
  })
  selectEle.innerHTML = htmlStr
}

init()
