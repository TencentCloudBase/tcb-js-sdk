import axios from 'axios';
import * as qs from 'qs';

import { Config, BASE_URL, JWT_KEY } from '../types';
import { Cache } from './cache';
import * as util from './util';

/**
 * @internal
 */
class Request {
  config: Config;
  cache: Cache;

  /**
   * 初始化
   *
   * @internal
   * @param config
   */
  constructor(config?: Config) {
    this.config = config;
    this.cache = new Cache();
  }

  /**
   * 发送请求
   *
   * @param action   - 接口
   * @param data  - 参数
   */
  send(action?: string, data?: Object): Promise<any> {
    let token = this.cache.getStore(JWT_KEY);

    let code: string | false;
    if (!token) {
      code = util.getQuery('code');
    }

    const slowQueryWarning = setTimeout(() => {
      console.warn('Database operation is longer than 3s. Please check query performance and your network environment.');
    }, 3000);

    let promise = Promise.resolve(null);
    if (!token && (action !== 'auth.getJwt' && action !== 'auth.traceUser')) { //生成token接口未返回，等待
      promise = this.waitToken();
    }

    try {
      return promise.then(() => {
        let onUploadProgress = data['onResponseReceived'] || undefined;

        let params: FormData | string;
        let contentType = 'application/x-www-form-urlencoded';

        const tmpObj = Object.assign({}, data, {
          action,
          env: this.config.env,
          appid: this.config.appid,
          traceUser: this.config.traceUser,
          token: this.cache.getStore(JWT_KEY),
          code
        });

        if (action === 'storage.uploadFile') {
          params = new FormData();
          for (let key in tmpObj) {
            if (tmpObj.hasOwnProperty(key) && tmpObj[key] !== undefined && key !== 'onResponseReceived') {
              params.append(key, tmpObj[key]);
            }
          }
          contentType = 'multipart/form-data';
        } else {
          params = qs.stringify(tmpObj);
        }

        let opts = {
          baseURL: BASE_URL,
          data: params,
          method: 'post',
          headers: {
            'content-type': contentType
          },
          onUploadProgress
        };

        return axios(opts).then((response) => {
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
        if (self.cache.getStore(JWT_KEY)) {
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