import { Db } from '@cloudbase/database';
import * as Storage from './storage';
import Auth from './auth';
import * as Functions from './functions';
import { Request } from './lib/request';
import { addEventListener } from './lib/events';
import { RequestMode } from './types';

type InitConfig = {
  env: string;
  timeout?: number;
  mode?: RequestMode;
}
const DEFAULT_INIT_CONFIG = {
  timeout: 15000,
  mode: RequestMode.WEB
};
class TCB {
  config: any
  authObj: Auth
  constructor(config?: InitConfig) {
    this.config = config ? config : this.config;
    this.authObj = undefined;
  }

  init(config: InitConfig) {
    this.config = {
      ...DEFAULT_INIT_CONFIG,
      ...config
    };

    return new TCB(this.config);
  }

  database(dbConfig?: object) {
    Db.reqClass = Request;

    if (!this.authObj) {
      console.warn('需要app.auth()授权');
      return;
    }
    Db.getAccessToken = this.authObj.getAccessToken.bind(this.authObj);
    if (!Db.ws) {
      Db.ws = null;
    }
    // getAccessToken
    return new Db({ ...this.config, ...dbConfig });
  }

  auth({ persistence }: { persistence?: string } = {}) {
    if (this.authObj) {
      console.warn('tcb实例只存在一个auth对象');
      return this.authObj;
    }
    Object.assign(this.config, { persistence: persistence || 'session' });
    this.authObj = new Auth(this.config);
    return this.authObj;
  }

  on(eventName: string, callback: Function) {
    return addEventListener.apply(this, [eventName, callback]);
  }

  callFunction(params: { name: string; data: any }, callback?: Function) {
    return Functions.callFunction.apply(this, [params, callback]);
  }

  deleteFile(params: { fileList: string[] }, callback?: Function) {
    return Storage.deleteFile.apply(this, [params, callback]);
  }

  getTempFileURL(params: { fileList: string[] }, callback?: Function) {
    return Storage.getTempFileURL.apply(this, [params, callback]);
  }

  downloadFile(params: { fileID: string }, callback?: Function) {
    return Storage.downloadFile.apply(this, [params, callback]);
  }

  uploadFile(params: { cloudPath: string; filePath: string; onUploadProgress?: Function }, callback?: Function) {
    return Storage.uploadFile.apply(this, [params, callback]);
  }
}

let tcb = new TCB();
try {
  (window as any).tcb = tcb;
} catch (e) { }

export = tcb;
