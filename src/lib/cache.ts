import { StorageInterface, AbstractStorage } from '@cloudbase/adapter-interface';
import { Adapter } from '../adapters';
import {
  Config,
  ACCESS_TOKEN,
  ACCESS_TOKEN_Expire,
  REFRESH_TOKEN,
  ANONYMOUS_UUID,
  LOGIN_TYPE_KEY,
  USER_INFO_KEY,
  KV
} from '../types';
import { isUndefined, isNull } from './util';

/**
 * @constant 始终存储在localstorage中的key集合
 */
const alwaysLocalKeys = ['anonymousUuidKey'];

class TcbObject extends AbstractStorage {
  constructor() {
    super();
    if (!Adapter.adapter.root['tcbObject']) {
      Adapter.adapter.root['tcbObject'] = {};
    }
  }

  // 保存数据到
  setItem(key: string, value: any) {
    Adapter.adapter.root['tcbObject'][key] = value;
  }

  // 获取数据
  getItem(key: string) {
    return Adapter.adapter.root['tcbObject'][key];
  }

  // 删除保存的数据
  removeItem(key: string) {
    delete Adapter.adapter.root['tcbObject'][key];
  }

  // 删除所有保存的数据
  clear() {
    delete Adapter.adapter.root['tcbObject'];
  }
}

function createStorage(persistence: string, adapter: any): StorageInterface {
  switch (persistence) {
    case 'local':
      return adapter.localStorage || new TcbObject();
    case 'none':
      return new TcbObject();
    default:
      return adapter.sessionStorage || new TcbObject();
  }
}

export class ICache {
  public keys: {
    accessTokenKey: string;
    accessTokenExpireKey: string;
    refreshTokenKey: string;
    anonymousUuidKey: string;
    loginTypeKey: string;
    userInfoKey: string;
  };

  private _persistence: string;
  private _storage: StorageInterface;

  constructor(config: Config) {
    if (!this._storage) {
      this._persistence = Adapter.adapter.primaryStorage || config.persistence;
      this._storage = createStorage(this._persistence, Adapter.adapter);

      const accessTokenKey = `${ACCESS_TOKEN}_${config.env}`;
      const accessTokenExpireKey = `${ACCESS_TOKEN_Expire}_${config.env}`;
      const refreshTokenKey = `${REFRESH_TOKEN}_${config.env}`;
      const anonymousUuidKey = `${ANONYMOUS_UUID}_${config.env}`;
      const loginTypeKey = `${LOGIN_TYPE_KEY}_${config.env}`;

      const userInfoKey = `${USER_INFO_KEY}_${config.env}`;
      this.keys = {
        accessTokenKey,
        accessTokenExpireKey,
        refreshTokenKey,
        anonymousUuidKey,
        loginTypeKey,
        userInfoKey
      };
    }
  }
  public updatePersistence(persistence: string) {
    if (persistence === this._persistence) {
      return;
    }
    const isCurrentLocal = this._persistence === 'local';
    this._persistence = persistence;
    const storage = createStorage(persistence, Adapter.adapter);
    // 切换persistence重新创建storage对象
    for (const key in this.keys) {
      const name = this.keys[key];
      // 如果当前为local并且key被设定为始终存储在localstorage中，则不迁移
      if (isCurrentLocal && alwaysLocalKeys.includes(key)) {
        continue;
      }
      const val = this._storage.getItem(name);
      if (!isUndefined(val) && !isNull(val)) {
        storage.setItem(name, val);
        this._storage.removeItem(name);
      }
    }
    this._storage = storage;
  }
  public setStore(key: string, value: any, version?: any) {
    if (!this._storage) {
      return;
    }

    const d = {
      version: version || 'localCachev1',
      content: value
    };
    const content = JSON.stringify(d);

    try {
      this._storage.setItem(key, content);
    } catch (e) {
      return;
    }
    return;
  }

  /*
   *获取缓存
   */
  getStore(key: string, version?: string): any {
    // forceLocal强制取localstory
    try {
      //测试用例使用
      if (process && process.env && process.env.tcb_token) {
        return process.env.tcb_token;
      }

      if (!this._storage) {
        return;
      }
    } catch (e) {
      return '';
    }

    version = version || 'localCachev1';

    const content = this._storage.getItem(key);
    if (!content) {
      return '';
    }

    if (content.indexOf(version) >= 0) {
      const d = JSON.parse(content);
      return d.content;
    } else {
      return '';
    }
  }

  /*
   *删除缓存
   */
  removeStore(key) {
    this._storage.removeItem(key);
  }
}

const cacheMap: KV<ICache> = {};
// 本地存储
const localCacheMap: KV<ICache> = {};

function initCache(config: Config) {
  const { env } = config;
  cacheMap[env] = new ICache(config);
  localCacheMap[env] = new ICache({
    ...config,
    persistence: 'local'
  });

}

function getCache(env: string): ICache {
  return cacheMap[env];
}

function getLocalCache(env: string): ICache {
  return localCacheMap[env];
}

export { getCache, initCache, getLocalCache };
