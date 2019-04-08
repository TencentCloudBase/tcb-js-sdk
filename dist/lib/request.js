"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var types_1 = require("../types");
var cache_1 = require("./cache");
var util = require("./util");
var Request = (function () {
    function Request(config) {
        this.config = config;
        this.cache = new cache_1.Cache();
    }
    Request.prototype.send = function (action, data) {
        var _this = this;
        var token = this.cache.getStore(types_1.JWT_KEY);
        var code;
        if (!token) {
            code = util.getQuery('code');
        }
        var slowQueryWarning = setTimeout(function () {
            console.warn('Database operation is longer than 3s. Please check query performance and your network environment.');
        }, 3000);
        var promise = Promise.resolve(null);
        if (!token && (action !== 'auth.getJwt')) {
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
                    token: _this.cache.getStore(types_1.JWT_KEY),
                    code: code
                });
                if (action === 'storage.uploadFile') {
                    params = new FormData();
                    for (var key in tmpObj) {
                        if (tmpObj.hasOwnProperty(key) && tmpObj[key] !== undefined && key !== 'onUploadProgress') {
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
                return axios_1.default.post(types_1.BASE_URL, params, opts).then(function (response) {
                    if (response.statusText === 'OK') {
                        return response.data;
                    }
                    throw new Error('network request error');
                }).catch(function (err) {
                    return err;
                });
            });
        }
        finally {
            clearTimeout(slowQueryWarning);
        }
    };
    Request.prototype.waitToken = function () {
        var self = this;
        var waitedTime = 0;
        return new Promise(function (resolve, reject) {
            var intervalId = setInterval(function () {
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
    };
    return Request;
}());
exports.Request = Request;
