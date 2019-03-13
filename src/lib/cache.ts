class Cache {
  memStoreMap: object

  constructor() {
    this.memStoreMap = {};
  }

  setStore(key: string, value: any, cacheTime?: number, version?: any) {
    try {
      if (!window.localStorage) {
        return;
      }
    }
    catch (e) {
      return;
    }
    let content = '';

    if (!cacheTime) {  // 如果没有cacheTime，就返回吧，没有意义！
      return;
    }

    let d: {
      version?: any;
      dataVersion?: any;
      cacheTime?: number;
      content?: any;
    } = {};
    d.version = 'localCachev1';
    d.dataVersion = version;
    d.cacheTime = ((new Date()).getTime() + (cacheTime ? cacheTime : 0));
    d.content = value;
    content = JSON.stringify(d);

    try {
      this.memStoreMap[key] = content;
      localStorage.setItem(key, content);
    }
    catch (e) {
      return;
    }
    return;
  }

  /*
  *获取缓存
  */
  getStore(key: string, version?: string, forceLocal?: boolean): any { // forceLocal强制取localstory
    try {
      //测试用例使用
      if (process && process.env && process.env.tcb_token) {
        return process.env.tcb_token;
      }

      if (!window.localStorage) {
        return false;
      }
    }
    catch (e) {
      return '';
    }

    let content = '';
    if (forceLocal) {
      content = localStorage.getItem(key);
    } else {
      content = this.memStoreMap[key] || localStorage.getItem(key);
    }
    if (!content) { return '' }
    if (content.indexOf('localCachev1') >= 0) {
      let d = JSON.parse(content);
      // 检查数据版本是否有效
      if (d.dataVersion !== version) {
        return '';
      }
      // 检查cache是否有效
      if (d.cacheTime >= (new Date()).getTime()) {
        return d.content;
      } else {
        this.removeStore(key);
        return '';
      }
    } else {
      return content;
    }
  }

  /*
  *删除缓存
  */
  removeStore(key) {
    try {
      if (!window.localStorage) {
        return this;
      }
    }
    catch (e) {
      return this;
    }
    localStorage.removeItem(key);
    this.memStoreMap[key] = undefined;
    delete this.memStoreMap[key];
    return this;
  }

}

export { Cache };