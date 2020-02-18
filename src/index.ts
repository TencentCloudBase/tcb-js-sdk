import { Db } from '@cloudbase/database';
import adapterForWxMp from '@cloudbase/adapter-wx_mp';
import { Auth } from './auth';
import * as Storage from './storage';
import * as Functions from './functions';
import { IRequest, initRequest } from './lib/request';
import { addEventListener, removeEventListener } from './lib/events';
import { useAdapters, Adapter, useDefaultAdapter, RUNTIME } from './adapters';
import { SDKAdapterInterface, CloudbaseAdapter, IRequestConfig } from '@cloudbase/adapter-interface';
import { AppSecret, dataVersion } from './types';
import { createSign } from './lib/util';
import { initCache } from './lib/cache';

interface ICloudbaseConfig {
  env: string;
  timeout?: number;
  persistence?: string;
  adapter?: SDKAdapterInterface;
  appSecret?: AppSecret;
  appSign?: string;
}
/**
 * @constant 默认配置
 */
const DEFAULT_INIT_CONFIG = {
  timeout: 15000,
  persistence: 'session'
};

// timeout上限10分钟
const MAX_TIMEOUT = 1000 * 60 * 10;
// timeout下限100ms
const MIN_TIMEOUT = 100;

type Persistence = 'local' | 'session' | 'none';

const extensionMap = {};

class TCB {
  config: ICloudbaseConfig;
  authObj: Auth;
  requestClient: any;

  constructor(config?: ICloudbaseConfig) {
    this.config = config ? config : this.config;
    this.authObj = undefined;

    if (Adapter.adapter) {
      // eslint-disable-next-line
      this.requestClient = new Adapter.adapter.reqClass(<IRequestConfig>{
        timeout: this.config.timeout,
        timeoutMsg: `[tcb-js-sdk] 请求在${this.config.timeout / 1000}s内未完成，已中断`
      });
    }
  }

  init(config: ICloudbaseConfig) {
    // 调用初始化时若未兼容平台，则使用默认adapter
    if (!Adapter.adapter) {
      this._useDefaultAdapter();
      // eslint-disable-next-line
      this.requestClient = new Adapter.adapter.reqClass(<IRequestConfig>{
        timeout: config.timeout || 5000,
        timeoutMsg: `[tcb-js-sdk] 请求在${(config.timeout || 5000) / 1000}s内未完成，已中断`
      });
    }
    if (Adapter.runtime !== RUNTIME.WEB) {
      if (!config.appSecret) {
        throw new Error('[tcb-js-sdk]参数错误：请正确配置appSecret');
      }
      // adapter提供获取应用标识的接口
      const appSign = Adapter.adapter.getAppSign ? Adapter.adapter.getAppSign() : '';
      if (config.appSign && appSign && config.appSign !== appSign) {
        // 传入的appSign与sdk获取的不一致
        throw new Error('[tcb-js-sdk]参数错误：非法的应用标识');
      }
      appSign && (config.appSign = appSign);
      if (!config.appSign) {
        throw new Error('[tcb-js-sdk]参数错误：请正确配置应用标识');
      }
    }
    this.config = {
      ...DEFAULT_INIT_CONFIG,
      ...config
    };
    switch (true) {
      case this.config.timeout > MAX_TIMEOUT:
        console.warn('[tcb-js-sdk] timeout大于可配置上限[10分钟]，已重置为上限数值');
        this.config.timeout = MAX_TIMEOUT;
        break;
      case this.config.timeout < MIN_TIMEOUT:
        console.warn('[tcb-js-sdk] timeout小于可配置下限[100ms]，已重置为下限数值');
        this.config.timeout = MIN_TIMEOUT;
        break;
    }
    return new TCB(this.config);
  }

  database(dbConfig?: object) {
    Db.reqClass = IRequest;
    // @ts-ignore
    Db.wsClass = Adapter.adapter.wsClass;

    if (!this.authObj) {
      console.warn('需要app.auth()授权');
      return;
    }
    Db.getAccessToken = this.authObj.getAccessToken.bind(this.authObj);
    Db.runtime = Adapter.runtime;
    if (Adapter.runtime !== RUNTIME.WEB) {
      Db.dataVersion = dataVersion;
      Db.createSign = createSign;

      Db.appSecretInfo = {
        appSign: this.config.appSign,
        ...this.config.appSecret
      };
    }
    if (!Db.ws) {
      Db.ws = null;
    }

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
    initCache(this.config);
    // 初始化request
    initRequest(this.config);
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

  getUploadMetadata(
    params: { cloudPath: string; ci?: Object },
    callback?: Function
  ) {
    return Storage.getUploadMetadata.apply(this, [params, callback]);
  }

  registerExtension(ext) {
    extensionMap[ext.name] = ext;
  }

  async invokeExtension(name, opts) {
    const ext = extensionMap[name];
    if (!ext) {
      throw Error(`扩展${name} 必须先注册`);
    }

    let res = await ext.invoke(opts, this);
    return res;
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
