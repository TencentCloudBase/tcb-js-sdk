const app = require("./index");
const Config = require("../test/config.local");

const config = {
  secretId: Config.secretId,
  secretKey: Config.secretKey,
  env: "web-test-jimmy-0cf5fa",
  mpAppId: "wxacfb81f2ced64e70",
  proxy: Config.proxy,
  sessionToken: undefined
};

app.init(config);
let auth = app.auth({
  persistence: "local"
});

auth
  .weixinAuthProvider({
    appid: "wxacfb81f2ced64e70",
    scope: "snsapi_base"
  })
  .signIn(function(err, res) {});

const db = app.database();
const _ = db.command;

const collName = "coll";
const collection = db.collection(collName);

collection
  .where({
    k: 2
  })
  .watch({
    success: events => {
      console.log("receive events:", events);
    },
    fail: () => {}
  });
