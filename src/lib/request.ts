import axios from 'axios';

import { Config, BASE_URL, JWT_KEY } from '../types';
import { Cache } from './cache';
import * as util from './util';

/**
 * @internal
 */
class Request {
  config: Config;
  cache: Cache;
  localKey: string;

  /**
   * 初始化
   *
   * @internal
   * @param config
   */
  constructor(config?: Config) {
    this.config = config;
    this.cache = new Cache(config.persistence);
    this.localKey = `${JWT_KEY}_${config.env}`;
  }

  /**
   * 发送请求
   *
   * @param action   - 接口
   * @param data  - 参数
   */
  send(action?: string, data?: Object): Promise<any> {
    let token = this.cache.getStore(this.localKey);

    let code: string | false;
    if (!token) {
      code = util.getQuery('code');
    }

    const slowQueryWarning = setTimeout(() => {
      console.warn('Database operation is longer than 3s. Please check query performance and your network environment.');
    }, 3000);

    let promise = Promise.resolve(null);
    if (!token && (action !== 'auth.getJwt')) { //生成token接口未返回，等待
      promise = this.waitToken();
    }

    try {
      return promise.then(() => {
        let onUploadProgress = data['onUploadProgress'] || undefined;

        let params: any;
        let contentType = 'application/x-www-form-urlencoded';

        const tmpObj = Object.assign({}, data, {
          action,
          env: this.config.env,
          token: this.cache.getStore(this.localKey),
          code,
          dataVersion: '2019-05-30'
        });

        if (action === 'storage.uploadFile') {
          params = new FormData();
          for (let key in tmpObj) {
            if (tmpObj.hasOwnProperty(key) && tmpObj[key] !== undefined && key !== 'onUploadProgress') {
              params.append(key, tmpObj[key]);
            }
          }
          contentType = 'multipart/form-data';
        } else {
          // Object.keys(tmpObj).forEach((key) => {
          //   if ((typeof tmpObj[key]) === 'object') {
          //     tmpObj[key] = JSON.stringify(tmpObj[key]); // 这里必须使用内置JSON对象转换
          //   }
          // });
          // params = qs.stringify(tmpObj); // 这里必须使用qs库进行转换
          contentType = 'application/json;charset=UTF-8';
          params = tmpObj;
        }

        let opts = {
          headers: {
            'content-type': contentType
          },
          onUploadProgress
        };

        return axios.post(BASE_URL, params, opts).then((response) => {
          if (response.statusText === 'OK') {
            return response.data;
          }
          throw new Error('network request error');
        }).catch((err) => {
          return err;
        });
      });
    } finally {
      clearTimeout(slowQueryWarning);
    }
  }

  waitToken() {
    let self = this;

    let waitedTime = 0;
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        if (self.cache.getStore(this.localKey)) {
          clearInterval(intervalId);
          resolve();
        }

        waitedTime += 10;
        if (waitedTime > 5000) {
          reject(new Error('request timed out'));
        }
      }, 10);
    });
  }
}

export { Request };