"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const qs = require("qs");
const types_1 = require("../types");
const cache_1 = require("./cache");
const util = require("./util");
class Request {
    constructor(config) {
        this.config = config;
        this.cache = new cache_1.Cache();
    }
    send(action, data, callback) {
        let token = this.cache.getStore(types_1.JWT_KEY);
        let code;
        if (!token) {
            code = util.getQuery('code');
        }
        const slowQueryWarning = setTimeout(() => {
            console.warn('Database operation is longer than 3s. Please check query performance and your network environment.');
        }, 3000);
        let promise = Promise.resolve(null);
        if (action !== 'auth.getJwt' && !token) {
            promise = this.waitToken();
        }
        try {
            return promise.then(() => {
                const params = Object.assign({}, data, {
                    action,
                    env: this.config.env,
                    appid: this.config.appid,
                    traceUser: this.config.traceUser,
                    token: this.cache.getStore(types_1.JWT_KEY),
                    code
                });
                let opts = {
                    baseURL: types_1.BASE_URL,
                    data: qs.stringify(params),
                    method: 'post',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    onUploadProgress: undefined
                };
                if (action === '') {
                    opts.onUploadProgress = function (progressEvent) {
                        callback && callback(progressEvent);
                    };
                }
                return axios_1.default(opts).then((response) => {
                    if (response.statusText === 'OK') {
                        return response.data;
                    }
                    throw new Error('network request error');
                }).catch((err) => {
                    return err;
                });
            });
        }
        finally {
            clearTimeout(slowQueryWarning);
        }
    }
    waitToken() {
        let self = this;
        let waitedTime = 0;
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(() => {
                if (self.cache.getStore(types_1.JWT_KEY)) {
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
exports.Request = Request;
