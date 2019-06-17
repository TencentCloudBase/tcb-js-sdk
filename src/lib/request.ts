import axios from "axios";

import {
  Config,
  BASE_URL,
  ACCESS_TOKEN,
  ACCESS_TOKEN_Expire,
  REFRESH_TOKEN
} from "../types";
import { Cache } from "./cache";
import * as util from "./util";
import { activateEvent } from "../auth/listener";

const Max_Retry_Times = 5;

/**
 * @internal
 */
class Request {
  config: Config;
  cache: Cache;
  accessTokenKey: string;
  accessTokenExpireKey: string;
  refreshTokenKey: string;

  /**
   * 初始化
   *
   * @internal
   * @param config
   */
  constructor(config?: Config) {
    this.config = config;
    this.cache = new Cache(config.persistence);

    this.accessTokenKey = `${ACCESS_TOKEN}_${config.env}`;
    this.accessTokenExpireKey = `${ACCESS_TOKEN_Expire}_${config.env}`;
    this.refreshTokenKey = `${REFRESH_TOKEN}_${config.env}`;
  }

  /**
   * 发送请求
   *
   * @param action   - 接口
   * @param data  - 参数
   */
  send(action?: string, data?: Object, retryTimes?: number): Promise<any> {
    let initData = Object.assign({}, data);
    retryTimes = retryTimes || 0;
    if (retryTimes > Max_Retry_Times) {
      activateEvent("LoginStateExpire");
      throw new Error("LoginStateExpire");
    }
    retryTimes++;

    let accessToken = this.cache.getStore(this.accessTokenKey);
    let accessTokenExpire = this.cache.getStore(this.accessTokenExpireKey);
    if (accessTokenExpire && accessTokenExpire < Date.now()) {
      this.cache.removeStore(this.accessTokenKey);
      this.cache.removeStore(this.accessTokenExpireKey);
      accessToken = null;
    } else if (
      accessToken &&
      accessTokenExpire > Date.now &&
      action == "auth.getJwt"
    ) {
      return Promise.resolve({ access_token: accessToken });
    }
    let refreshToken = this.cache.getStore(this.refreshTokenKey);

    let code: string | false;

    if (!refreshToken) {
      code = util.getWeixinCode();
    }

    const slowQueryWarning = setTimeout(() => {
      console.warn(
        "Database operation is longer than 3s. Please check query performance and your network environment."
      );
    }, 3000);

    let promise = Promise.resolve(null);
    if (!refreshToken && action !== "auth.getJwt" && action !== "auth.logout") {
      //生成token接口未返回，等待
      promise = this.waitToken();
    }

    try {
      return promise.then(() => {
        let onUploadProgress = data["onUploadProgress"] || undefined;

        let params: any;
        let contentType = "application/x-www-form-urlencoded";

        const tmpObj: any = Object.assign({}, data, {
          action,
          env: this.config.env,
          code,
          dataVersion: "2019-05-30"
        });
        if (accessToken) {
          tmpObj.access_token = this.cache.getStore(this.accessTokenKey);
        } else if (refreshToken) {
          tmpObj.refresh_token = this.cache.getStore(this.refreshTokenKey);
          tmpObj.action = "auth.getJwt";
        }

        if (action === "storage.uploadFile") {
          params = new FormData();
          for (let key in tmpObj) {
            if (
              tmpObj.hasOwnProperty(key) &&
              tmpObj[key] !== undefined &&
              key !== "onUploadProgress"
            ) {
              params.append(key, tmpObj[key]);
            }
          }
          contentType = "multipart/form-data";
        } else {
          // Object.keys(tmpObj).forEach((key) => {
          //   if ((typeof tmpObj[key]) === 'object') {
          //     tmpObj[key] = JSON.stringify(tmpObj[key]); // 这里必须使用内置JSON对象转换
          //   }
          // });
          // params = qs.stringify(tmpObj); // 这里必须使用qs库进行转换
          contentType = "application/json;charset=UTF-8";
          params = tmpObj;
        }

        let opts = {
          headers: {
            "content-type": contentType
          },
          onUploadProgress
        };

        let self = this;
        let urlPre = BASE_URL;
        // let paramsPre = params
        // let optsPre = opts
        function postRequest() {
          return axios
            .post(urlPre, params, opts)
            .then(response => {
              if (Number(response.status) === 200) {
                if (retryTimes > Max_Retry_Times) {
                  activateEvent("LoginStateExpire");
                  console.error("[tcb-js-sdk] 登录态请求循环尝试次数超限");
                  throw new Error("LoginStateExpire");
                }
                if (response.data) {
                  if (
                    response.data.code === "SIGN_PARAM_INVALID" ||
                    response.data.code === "REFRESH_TOKEN_EXPIRED"
                  ) {
                    activateEvent("LoginStateExpire");
                    self.cache.removeStore(self.refreshTokenKey);
                  } else if (response.data.code === "CHECK_LOGIN_FAILED") {
                    // access_token过期，重新获取
                    self.cache.removeStore(self.accessTokenKey);
                    self.cache.removeStore(self.accessTokenExpireKey);
                    return self.send(action, initData, ++retryTimes);
                  } else {
                    if (action === "auth.getJwt") {
                      return response.data;
                    } else {
                      if (
                        response.data.access_token ||
                        response.data.refresh_token
                      ) {
                        if (response.data.access_token) {
                          self.cache.setStore(
                            self.accessTokenKey,
                            response.data.access_token
                          );
                          // 本地时间可能没有同步
                          self.cache.setStore(
                            self.accessTokenExpireKey,
                            response.data.access_token_expire + Date.now()
                          );
                        }
                        if (response.data.refresh_token) {
                          self.cache.setStore(
                            self.refreshTokenKey,
                            response.data.refresh_token
                          );
                        }
                        return self.send(action, initData, ++retryTimes);
                      } else {
                        return response.data;
                      }
                    }
                  }
                }
                return response.data;
              }
              throw new Error("network request error");
            })
            .catch(err => {
              return err;
            });
        }
        return postRequest();
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
        if (self.cache.getStore(this.refreshTokenKey)) {
          clearInterval(intervalId);
          resolve();
        }

        waitedTime += 10;
        if (waitedTime > 5000) {
          reject(new Error("request timed out"));
        }
      }, 10);
    });
  }
}

export { Request };
