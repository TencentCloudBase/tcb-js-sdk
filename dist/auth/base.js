"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var cache_1 = require("../lib/cache");
var LOGINTYPE;
(function (LOGINTYPE) {
    LOGINTYPE["ANONYMOUS"] = "ANONYMOUS";
    LOGINTYPE["WECHAT"] = "WECHAT";
    LOGINTYPE["CUSTOM"] = "CUSTOM";
    LOGINTYPE["NULL"] = "NULL";
})(LOGINTYPE = exports.LOGINTYPE || (exports.LOGINTYPE = {}));
var AuthProvider = (function () {
    function AuthProvider(config) {
        this.config = config;
        this._cache = cache_1.getCache(config.env);
        this._request = request_1.getRequestByEnvId(config.env);
    }
    AuthProvider.prototype.setRefreshToken = function (refreshToken) {
        var _a = this._cache.keys, accessTokenKey = _a.accessTokenKey, accessTokenExpireKey = _a.accessTokenExpireKey, refreshTokenKey = _a.refreshTokenKey;
        this._cache.removeStore(accessTokenKey);
        this._cache.removeStore(accessTokenExpireKey);
        this._cache.setStore(refreshTokenKey, refreshToken);
    };
    return AuthProvider;
}());
exports.AuthProvider = AuthProvider;
