import { AbstractStorage } from '@cloudbase/adapter-interface';
import { Adapter } from '../adapters';

class Cache {
  storageClass: any;
  constructor(persistence: string) {
    const _persistence = Adapter.adapter.primaryStorage || persistence;
    switch (_persistence) {
      case 'local':
        this.storageClass = Adapter.adapter.localStorage || new TcbObject();
        break;
      case 'none':
        this.storageClass = new TcbObject();
        break;
      default:
        this.storageClass = Adapter.adapter.sessionStorage || new TcbObject();
        break;
    }
  }

  setStore(key: string, value: any, version?: any) {
    try {
      if (!this.storageClass) {
        return;
      }
    }
    catch (e) {
      return;
    }
    let content = '';

    let d: {
      version?: any;
      content?: any;
    } = {};
    d.version = version || 'localCachev1';
    d.content = value;
    content = JSON.stringify(d);

    try {
      this.storageClass.setItem(key, content);
    }
    catch (e) {
      return;
    }
    return;
  }

  /*
  *获取缓存
  */
  getStore(key: string, version?: string): any { // forceLocal强制取localstory
    try {
      //测试用例使用
      if (process && process.env && process.env.tcb_token) {
        return process.env.tcb_token;
      }

      if (!this.storageClass) {
        return;
      }
    }
    catch (e) {
      return '';
    }

    version = version || 'localCachev1';

    let content = this.storageClass.getItem(key);
    if (!content) {
      return '';
    }

    if (content.indexOf(version) >= 0) {
      let d = JSON.parse(content);
      return d.content;
    } else {
      return '';
    }
  }

  /*
  *删除缓存
  */
  removeStore(key) {
    this.storageClass.removeItem(key);
  }

}

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
export { Cache };