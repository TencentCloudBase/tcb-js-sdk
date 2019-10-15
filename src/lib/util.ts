export const getQuery = function(name: string, url?: string) {
  if (typeof window === 'undefined') {
    return false;
  }
  // 参数：变量名，url为空则表从当前页面的url中取
  let u = url || window.location.search;
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  let r = u.substr(u.indexOf('?') + 1).match(reg);
  return r != null ? r[2] : '';
};

export const getHash = function(name: string) {
  const matches = window.location.hash.match(
    new RegExp(`[#\?&\/]${name}=([^&#]*)`)
  );
  return matches ? matches[1] : '';
  // const arr = (window.location.hash || '').replace(/^\#/, '').split('&');
  // for (let i = 0; i < arr.length; i++) {
  //   let data = arr[i].split('=');
  //   if (data[0] === name) {
  //     return data[1];
  //   }
  // }
  // return '';
};

export const removeParam = function(key: string, sourceURL: string) {
  let rtn = sourceURL.split('?')[0];
  let param;
  let params_arr = [];
  let queryString =
    sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';
  if (queryString !== '') {
    params_arr = queryString.split('&');
    for (let i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split('=')[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    rtn = rtn + '?' + params_arr.join('&');
  }
  return rtn;
};

export const createPromiseCallback = () => {
  let cb: any;
  if (!Promise) {
    cb = () => {};
    cb.promise = {};

    const throwPromiseNotDefined = () => {
      throw new Error(
        'Your Node runtime does support ES6 Promises. ' +
          'Set "global.Promise" to your preferred implementation of promises.'
      );
    };

    Object.defineProperty(cb.promise, 'then', { get: throwPromiseNotDefined });
    Object.defineProperty(cb.promise, 'catch', { get: throwPromiseNotDefined });
    return cb;
  }

  const promise = new Promise((resolve, reject) => {
    cb = (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    };
  });
  cb.promise = promise;
  return cb;
};

export const getWeixinCode = function() {
  return getQuery('code') || getHash('code');
};

export const getMiniAppCode = function(): Promise<string> {
  return new Promise(resolve => {
    wx.login({
      success(res) {
        resolve(res.code);
      },
      fail(err) {
        resolve(err);
      }
    });
  });
};