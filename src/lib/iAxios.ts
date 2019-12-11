import superagent from 'superagent';
import { CommonRequestOptions } from './request';
import { KV } from '../types';

class IAxios {
  get(url: string, options: CommonRequestOptions = {}) {
    return new Promise((resolve, reject) => {
      const request = superagent.get(url);

      const { headers = {}, responseType } = options;
      for (const name in headers) {
        const val = headers[name];
        val && request.set(name, val);
      }
      responseType && request.responseType(responseType);
      request.end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            status: res.status,
            data: res.body
          });
        }
      });
    });
  }
  post(url: string, data: KV<any>, options: CommonRequestOptions = {}) {
    return new Promise((resolve, reject) => {
      const request = superagent.post(url);

      const { headers = {}} = options;
      for (const name in headers) {
        const val = headers[name];
        val && request.set(name, val);
      }
      request.send(data).end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            status: res.status,
            data: res.body
          });
        }
      });
    });
  }
}

export default new IAxios();
