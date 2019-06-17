import * as Storage from './storage';
import Auth from './auth';
import * as Functions from './functions';
import { Request } from './lib/request';
// import { Db } from '@cloudbase/database';
const Db = require('@cloudbase/database').Db;

function TCB(config?: object) {
  // console.log(config)
  this.config = config ? config : this.config;
  this.authObj
}

TCB.prototype.init = function (config: {
  env: string;
  timeout: number;
}) {
  this.config = {
    env: config.env,
    timeout: config.timeout || 15000
  };

  return new TCB(this.config);
};

TCB.prototype.database = function (dbConfig?: object) {
  Db.reqClass = Request;
  return new Db({ ...this.config, ...dbConfig });
};

TCB.prototype.auth = function ({ persistence }: { persistence?: string; } = {}) {
  if (this.authObj) {
    console.warn('tcb实例只存在一个auth对象')
    return this.authObj
  }
  Object.assign(this.config, { persistence: persistence || 'session' });
  this.authObj = new Auth(this.config);
  return this.authObj
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
module.exports = tcb;