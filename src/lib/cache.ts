class Cache {
  storageClass: any;

  constructor(persistence: string) {
    switch (persistence) {
      case 'local':
        this.storageClass = typeof cc !== 'undefined' && cc.sys ? cc.sys.localStorage : localStorage;
        break;
      case 'none':
        this.storageClass = new TcbObject();
        break;
      case 'weixin':
        this.storageClass = new TcbMiniappStorage();
        break;
      default:
        this.storageClass = typeof cc !== 'undefined' && cc.sys ? cc.sys.localStorage : sessionStorage;
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

class TcbObject {
  constructor() {
    if (!window['tcbObject']) {
      window['tcbObject'] = {};
    }
  }

  // 保存数据到
  setItem(key: string, value: any) {
    window['tcbObject'][key] = value;
  }

  // 获取数据
  getItem(key: string) {
    return window['tcbObject'][key];
  }

  // 删除保存的数据
  removeItem(key: string) {
    delete window['tcbObject'][key];
  }

  // 删除所有保存的数据
  clear() {
    delete window['tcbObject'];
  }
}

class TcbMiniappStorage {
  // 保存数据到
  setItem(key: string, value: any) {
    wx.setStorageSync(key, value);
  }

  // 获取数据
  getItem(key: string) {
    return wx.getStorageSync(key);
  }

  // 删除保存的数据
  removeItem(key: string) {
    wx.removeStorageSync(key);
  }

  // 删除所有保存的数据
  clear() {
    wx.clearStorageSync();
  }
}
export { Cache };