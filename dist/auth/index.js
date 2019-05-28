"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var weixinAuthProvider_1 = require("./weixinAuthProvider");
var cache_1 = require("../lib/cache");
var types_1 = require("../types");
var Auth = (function () {
    function Auth(config) {
        this.httpRequest = new request_1.Request(config);
        this.config = config;
    }
    Auth.prototype.weixinAuthProvider = function (_a) {
        var appid = _a.appid, scope = _a.scope, loginMode = _a.loginMode, state = _a.state;
        return new weixinAuthProvider_1.default(this.config, appid, scope, loginMode, state);
    };
    Auth.prototype.signOut = function () {
        var cache = new cache_1.Cache(this.config.persistence);
        cache.removeStore(types_1.JWT_KEY + "_" + this.config.env);
    };
    Auth.prototype.getUserInfo = function () {
        var action = 'auth.getUserInfo';
        return this.httpRequest.send(action, {}).then(function (res) {
            if (res.code) {
                return res;
            }
            else {
                return __assign({}, res.data, { requestId: res.seqId });
            }
        });
    };
    return Auth;
}());
exports.default = Auth;
