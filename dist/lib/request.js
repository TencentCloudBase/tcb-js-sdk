"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var types_1 = require("../types");
var cache_1 = require("./cache");
var util = require("./util");
var listener_1 = require("../auth/listener");
var Max_Retry_Times = 5;
var Request = (function () {
    function Request(config) {
        this.config = config;
        this.cache = new cache_1.Cache(config.persistence);
        this.accessTokenKey = types_1.ACCESS_TOKEN + "_" + config.env;
        this.accessTokenExpireKey = types_1.ACCESS_TOKEN_Expire + "_" + config.env;
        this.refreshTokenKey = types_1.REFRESH_TOKEN + "_" + config.env;
    }
    Request.prototype.send = function (action, data, retryTimes) {
        var _this = this;
        var initData = Object.assign({}, data);
        retryTimes = retryTimes || 0;
        if (retryTimes > Max_Retry_Times) {
            listener_1.activateEvent('LoginStateExpire');
            throw new Error('LoginStateExpire');
        }
        retryTimes++;
        var accessToken = this.cache.getStore(this.accessTokenKey);
        var accessTokenExpire = this.cache.getStore(this.accessTokenExpireKey);
        if (accessTokenExpire && accessTokenExpire < Date.now()) {
            this.cache.removeStore(this.accessTokenKey);
            this.cache.removeStore(this.accessTokenExpireKey);
            accessToken = null;
        }
        else if (accessToken &&
            accessTokenExpire > Date.now &&
            action === 'auth.getJwt') {
            return Promise.resolve({ access_token: accessToken });
        }
        var refreshToken = this.cache.getStore(this.refreshTokenKey);
        var code;
        if (!refreshToken) {
            code = util.getWeixinCode();
        }
        var slowQueryWarning = setTimeout(function () {
            console.warn('Database operation is longer than 3s. Please check query performance and your network environment.');
        }, 3000);
        var promise = Promise.resolve(null);
        if (!refreshToken && action !== 'auth.getJwt' && action !== 'auth.logout') {
            promise = this.waitToken();
        }
        try {
            return promise.then(function () {
                var onUploadProgress = data['onUploadProgress'] || undefined;
                var params;
                var contentType = 'application/x-www-form-urlencoded';
                var tmpObj = Object.assign({}, data, {
                    action: action,
                    env: _this.config.env,
                    code: code,
                    dataVersion: '2019-05-30'
                });
                if (accessToken) {
                    tmpObj.access_token = _this.cache.getStore(_this.accessTokenKey);
                }
                else if (refreshToken) {
                    tmpObj.refresh_token = _this.cache.getStore(_this.refreshTokenKey);
                    tmpObj.action = 'auth.getJwt';
                }
                if (action === 'storage.uploadFile') {
                    params = new FormData();
                    for (var key in tmpObj) {
                        if (tmpObj.hasOwnProperty(key) &&
                            tmpObj[key] !== undefined &&
                            key !== 'onUploadProgress') {
                            params.append(key, tmpObj[key]);
                        }
                    }
                    contentType = 'multipart/form-data';
                }
                else {
                    contentType = 'application/json;charset=UTF-8';
                    params = tmpObj;
                }
                var opts = {
                    headers: {
                        'content-type': contentType
                    },
                    onUploadProgress: onUploadProgress
                };
                var self = _this;
                var urlPre = types_1.BASE_URL;
                function postRequest() {
                    return axios_1.default
                        .post(urlPre, params, opts)
                        .then(function (response) {
                        if (Number(response.status) === 200) {
                            if (retryTimes > Max_Retry_Times) {
                                listener_1.activateEvent('LoginStateExpire');
                                console.error('[tcb-js-sdk] 登录态请求循环尝试次数超限');
                                throw new Error('LoginStateExpire');
                            }
                            if (response.data) {
                                if (response.data.code === 'SIGN_PARAM_INVALID' ||
                                    response.data.code === 'REFRESH_TOKEN_EXPIRED') {
                                    listener_1.activateEvent('LoginStateExpire');
                                    self.cache.removeStore(self.refreshTokenKey);
                                }
                                else if (response.data.code === 'CHECK_LOGIN_FAILED') {
                                    self.cache.removeStore(self.accessTokenKey);
                                    self.cache.removeStore(self.accessTokenExpireKey);
                                    return self.send(action, initData, ++retryTimes);
                                }
                                else {
                                    if (action === 'auth.getJwt') {
                                        return response.data;
                                    }
                                    else {
                                        if (response.data.access_token ||
                                            response.data.refresh_token) {
                                            if (response.data.access_token) {
                                                self.cache.setStore(self.accessTokenKey, response.data.access_token);
                                                self.cache.setStore(self.accessTokenExpireKey, response.data.access_token_expire + Date.now());
                                            }
                                            if (response.data.refresh_token) {
                                                self.cache.setStore(self.refreshTokenKey, response.data.refresh_token);
                                            }
                                            return self.send(action, initData, ++retryTimes);
                                        }
                                        else {
                                            return response.data;
                                        }
                                    }
                                }
                            }
                            return response.data;
                        }
                        throw new Error('network request error');
                    })
                        .catch(function (err) {
                        return err;
                    });
                }
                return postRequest();
            });
        }
        finally {
            clearTimeout(slowQueryWarning);
        }
    };
    Request.prototype.waitToken = function () {
        var _this = this;
        var self = this;
        var waitedTime = 0;
        return new Promise(function (resolve, reject) {
            var intervalId = setInterval(function () {
                if (self.cache.getStore(_this.refreshTokenKey)) {
                    clearInterval(intervalId);
                    resolve();
                }
                waitedTime += 10;
                if (waitedTime > 5000) {
                    reject(new Error('request timed out'));
                }
            }, 10);
        });
    };
    return Request;
}());
exports.Request = Request;
