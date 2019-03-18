import * as Storage from './storage';
import { Db } from './database';
import Auth from './auth';
import * as Functions from './functions';
// import Login from './login';

function TCB(config?: object) {
  // console.log(config)
  this.config = config ? config : this.config;
}

TCB.prototype.init = function (config: {
  env: string;
  appid: string;
  timeout: number;
}) {
  if (!config.appid) {
    throw new Error('缺少必要参数公众号appid，请前往微信公众平台获取');
  }

  this.config = {
    appid: config.appid,
    env: config.env,
    timeout: config.timeout || 15000
  };

  return new TCB(this.config);
};

TCB.prototype.database = function (dbConfig?: object) {
  return new Db({ ...this.config, ...dbConfig });
};

TCB.prototype.auth = function() {
  return new Auth(this.config);
};

function each(obj: object, fn: Function) {
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      fn(obj[i], i);
    }
  }
}

function extend(target, source) {
  each(source, function (_val, key) {
    target[key] = source[key];
  });
  return target;
}

extend(TCB.prototype, Functions);
extend(TCB.prototype, Storage);

let tcb = new TCB();
try {
  (window as any).tcb = tcb;
} catch (e) { }

export default tcb;
