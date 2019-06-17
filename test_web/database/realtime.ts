// database db
import * as assert from "power-assert"
import { register } from "../util"
// import { test_auth } from "../auth"

export function registerRealtime(app, collName) {
  const db = app.database()
  let tcb = window["tcb"]
  // let appid = "wxacfb81f2ced64e70"

  app = tcb.init({
    //env: 'ianhu',
    // env: 'jimmytest-088bef'
    // env: 'webtestjimmy-5328c3'
    // env: 'feature-env-billing-004'
    // env: "dev-withnate-604e29"
    env: "web-test-jimmy-0cf5fa" //体验
  })

  // const db = app.database()
  const _ = db.command

  // collName = "coll-1"
  const collection = db.collection(collName)

  let ref1
  // let ref2

  // auth
  register("database realtime: data ready first", async () => {
    // await test_auth(app, appid)
    await collection.add({ test: 2 })
    await collection.add({ test: 4 })
    document.getElementById("mockAddDoc").onclick = async function() {
      // mock新增数据
      let res = await collection.add({ test: 10 })
      // console.log("add res**********", res)
      assert(res.id)
    }
  })

  // 关闭监听
  register("database realtime: close watch", async () => {
    ref1.close()
    // ref2.close()
  })

  // 多个监听
  register("database realtime: one watch init", () => {
    // const collection = db.collection(collName)
    // 监听1
    ref1 = collection.where({ test: _.gt(0) }).watch({
      onChange: snapshot => {
        if (snapshot.msgType === "INIT_EVENT") {
          assert(snapshot.docChanges.length > 0)
          console.log("收到init snapshot1**********", snapshot)

          // 生成nextevent
          // collection.add({ test: 2 })
        }

        if (snapshot.msgType === "NEXT_EVENT") {
          assert(snapshot.docChanges.length > 0)
          console.log("收到next snapshot1**********", snapshot)
        }
      },
      onError: error => {
        console.log("收到error1**********", error)
      }
    })

    // 监听2
    collection.where({ test: _.gt(2) }).watch({
      onChange: snapshot => {
        if (snapshot.msgType === "INIT_EVENT") {
          assert(snapshot.docChanges.length > 0)
          console.log("收到init snapshot2**********", snapshot)

          // 生成nextevent
          // collection.add({ test: 2 })
        }

        if (snapshot.msgType === "NEXT_EVENT") {
          assert(snapshot.docChanges.length > 0)
          console.log("收到next snapshot2**********", snapshot)
        }
      },
      onError: error => {
        console.log("收到error2**********", error)
      }
    })
  })
}
