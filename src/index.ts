import { Db } from '@cloudbase/database';
import adapterForWxMp from '@cloudbase/adapter-wx_mp';
import { Auth } from './auth';
import * as Storage from './storage';
import * as Functions from './functions';
import { Request, request } from './lib/request';
import { addEventListener, removeEventListener } from './lib/events';
import { useAdapters, Adapter, useDefaultAdapter } from './adapters';
import { SDKAdapterInterface, CloudbaseAdapter } from '@cloudbase/adapter-interface';
import { cache } from './lib/cache';

interface ICloudbaseConfig {
  env: string;
  timeout?: number;
  persistence?: string;
  adapter?: SDKAdapterInterface;
}
/**
 * @constant 默认配置
 */
const DEFAULT_INIT_CONFIG = {
  timeout: 15000,
  persistence: 'session'
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
    // 调用初始化时若未兼容平台，则使用默认adapter
    if (!Adapter.adapter) {
      this._useDefaultAdapter();
    }

    return new TCB(this.config);
  }

  database(dbConfig?: object) {
    Db.reqClass = Request;
    // @ts-ignore
    Db.wsClass = Adapter.adapter.wsClass;

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
    // 如不明确指定persistence则优先取各平台adapter首选，其次session
    const _persistence = persistence || Adapter.adapter.primaryStorage || DEFAULT_INIT_CONFIG.persistence;
    if (_persistence !== this.config.persistence) {
      this.config.persistence = _persistence;
    }

    // 初始化cache
    cache.init(this.config);
    // 初始化request
    request.init(this.config);

    this.authObj = new Auth(this.config);
    return this.authObj;
  }

  on(eventName: string, callback: Function) {
    return addEventListener.apply(this, [eventName, callback]);
  }

  off(eventName: string, callback: Function) {
    return removeEventListener.apply(this, [eventName, callback]);
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

  useAdapters(adapters: CloudbaseAdapter|CloudbaseAdapter[]) {
    const { adapter, runtime } = useAdapters(adapters) || {};
    adapter && (Adapter.adapter = adapter as SDKAdapterInterface);
    runtime && (Adapter.runtime = runtime as string);
  }

  private _useDefaultAdapter() {
    const { adapter, runtime } = useDefaultAdapter();
    Adapter.adapter = adapter as SDKAdapterInterface;
    Adapter.runtime = runtime as string;
  }
}

const tcb = new TCB();
tcb.useAdapters(adapterForWxMp);

// window 可能不存在
try {
  window['tcb'] = tcb;
} catch (e) {
  // 忽略错误
}
export = tcb;
