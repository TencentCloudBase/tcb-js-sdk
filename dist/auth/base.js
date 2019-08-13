"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var cache_1 = require("../lib/cache");
var types_1 = require("../types");
var events_1 = require("../lib/events");
var default_1 = (function () {
    function default_1(config) {
        this.httpRequest = new request_1.Request(config);
        this.cache = new cache_1.Cache(config.persistence);
        this.accessTokenKey = types_1.ACCESS_TOKEN + "_" + config.env;
        this.accessTokenExpireKey = types_1.ACCESS_TOKEN_Expire + "_" + config.env;
        this.refreshTokenKey = types_1.REFRESH_TOKEN + "_" + config.env;
    }
    default_1.prototype.setRefreshToken = function (refreshToken) {
        this.cache.setStore(this.refreshTokenKey, refreshToken);
    };
    default_1.prototype.getJwt = function (appid, loginType, code) {
        var action = 'auth.getJwt';
        var self = this;
        return this.httpRequest.send(action, { appid: appid, loginType: loginType, code: code }).then(function (res) {
            if (res.access_token) {
                self.cache.setStore(self.accessTokenKey, res.access_token);
                self.cache.setStore(self.accessTokenExpireKey, res.access_token_expire + Date.now());
            }
            if (res.refresh_token) {
                self.cache.setStore(self.refreshTokenKey, res.refresh_token);
            }
            if (res.code === 'CHECK_LOGIN_FAILED') {
                self.cache.removeStore(self.accessTokenKey);
                self.cache.removeStore(self.accessTokenExpireKey);
                return self.getJwt(appid, loginType);
            }
            if (res.code === 'REFRESH_TOKEN_EXPIRED') {
                self.cache.removeStore(self.refreshTokenKey);
                self.cache.removeStore(self.accessTokenKey);
                self.cache.removeStore(self.accessTokenExpireKey);
                events_1.activateEvent('LoginStateExpire');
                return res;
            }
            return res;
        });
    };
    return default_1;
}());
exports.default = default_1;
