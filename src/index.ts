import { Db } from '@cloudbase/database';
import Auth from './auth';
import * as Storage from './storage';
import * as Functions from './functions';
import { Request } from './lib/request';
import { addEventListener } from './lib/events';
import { RequestMode } from './types';

// eslint-disable-next-line
declare global {
  interface Window {
    tcb: TCB;
  }
}

interface ICloudbaseConfig {
  env: string;
  timeout?: number;
  mode?: RequestMode;
  persistence?: string;
}

const DEFAULT_INIT_CONFIG = {
  timeout: 15000,
  mode: RequestMode.WEB
};

type Persistence = 'local' | 'session' | 'none';

class TCB {
  config: ICloudbaseConfig;
  authObj: Auth;

  constructor(config?: ICloudbaseConfig) {
    this.config = config ? config : this.config;
    this.authObj = undefined;
  }

  init(config: ICloudbaseConfig) {
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

  auth({ persistence }: { persistence?: Persistence } = {}) {
    if (this.authObj) {
      console.warn('tcb实例只存在一个auth对象');
      return this.authObj;
    }
    this.config = {
      ...this.config,
      persistence: persistence || 'session'
    };

    this.authObj = new Auth(this.config);
    return this.authObj;
  }

  on(eventName: string, callback: Function) {
    return addEventListener.apply(this, [eventName, callback]);
  }

  callFunction(
    params: { name: string; data: any; query: any; parse: boolean },
    callback?: Function
  ) {
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

  uploadFile(
    params: { cloudPath: string; filePath: File; onUploadProgress?: Function },
    callback?: Function
  ) {
    return Storage.uploadFile.apply(this, [params, callback]);
  }
}

const tcb = new TCB();
// window 可能不存在
try {
  window.tcb = tcb;
} catch (e) {
  // 忽略错误
}

export = tcb;
