// database db
import * as assert from 'power-assert';
import { register } from '../util';
// import { test_auth } from "../auth"

export function registerRealtime(app, collName) {
  const db = app.database();
  // let tcb = window["tcb"]
  // let appid = "wxacfb81f2ced64e70"

  // app = tcb.init({
  //   //env: 'ianhu',
  //   // env: 'jimmytest-088bef'
  //   // env: 'webtestjimmy-5328c3'
  //   // env: 'feature-env-billing-004'
  //   // env: "dev-withnate-604e29"
  //   // env: "web-test-jimmy-0cf5fa" //体验
  // })

  // const db = app.database()
  const _ = db.command;

  // collName = "coll-1"
  const collection = db.collection(collName);

  const nextEventNum = 2;


  let ref1;
  // let ref2

  // auth
  register('database realtime: data ready first', async () => {
    // await test_auth(app, appid)
    await collection.add({ test: 2 });
    await collection.add({ test: 4 });
    document.getElementById('mockAddDoc').onclick = async function() {
      // mock新增数据
      let calNum = nextEventNum;
      while (calNum--) {
        let res = await collection.add({ test: 10 });
        assert(res.id);
      }
      // console.log("add res**********", res)
    };
  });

  // 关闭监听
  register('database realtime: close watch', async () => {
    ref1.close();
    // ref2.close()
  });

  // 测试doc().watch()
  register('database realtime: one doc watch', async () => {
    collection.doc('26b301645d4960410d34662e4065999a').watch({
      onChange: snapshot => {
        console.log('收到single doc snapshot**********', snapshot);

        collection.doc('26b301645d4960410d34662e4065999a').update({
          test: 20
        });
      },
      onError: error => {
        console.log('收到single doc error**********', error);
      }
    });
  });


  // 多个监听
  register('database realtime: one watch init', () => {
    // const collection = db.collection(collName)
    let watchNum = 100;
    const calWatchNum = 100;
    let initOkNum = 0;
    let nextOkObj = {};

    // 开启多个监听 测试所有监听是否收到initevent 及 nextevent
    while (watchNum--) {
      nextOkObj[watchNum] = 0;
      (function(watchNum) {
        collection.where({ test: _.gt(0) }).watch({
          onChange: snapshot => {
            if (snapshot.msgType === 'INIT_EVENT') {
              assert(snapshot.docChanges.length > 0);

              // console.log(`收到init snapshot${watchNum}**********`, snapshot)

              if (++initOkNum === calWatchNum) {
                console.log('init snapshot all receive');
              }
              // 生成nextevent

              // collection.add({ test: 2 })
            }

            if (snapshot.msgType === 'NEXT_EVENT') {
              nextOkObj[watchNum]++;

              if (nextOkObj[watchNum] === nextEventNum) {
                console.log('next snapshot all receive');
              }

              assert(snapshot.docChanges.length > 0);
              // console.log(`收到next snapshot${watchNum}**********`, snapshot)
            }
          },
          onError: error => {
            console.log('收到error1**********', error);
          }
        });
      })(watchNum);

    }



    // 监听2
    // collection.where({ test: _.gt(2) }).watch({
    //   onChange: snapshot => {
    //     if (snapshot.msgType === "INIT_EVENT") {
    //       assert(snapshot.docChanges.length > 0)
    //       console.log("收到init snapshot2**********", snapshot)

    //       // 生成nextevent
    //       // collection.add({ test: 2 })
    //     }

    //     if (snapshot.msgType === "NEXT_EVENT") {
    //       assert(snapshot.docChanges.length > 0)
    //       console.log("收到next snapshot2**********", snapshot)
    //     }
    //   },
    //   onError: error => {
    //     console.log("收到error2**********", error)
    //   }
    // })
  });
}
