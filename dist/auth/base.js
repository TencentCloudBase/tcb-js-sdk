"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var cache_1 = require("../lib/cache");
var types_1 = require("../types");
var default_1 = (function () {
    function default_1(config) {
        this.httpRequest = new request_1.Request(config);
        this.cache = new cache_1.Cache();
    }
    default_1.prototype.signOut = function () {
        this.cache.removeStore(types_1.JWT_KEY);
    };
    default_1.prototype.getJwt = function (appid, loginType) {
        var action = 'auth.getJwt';
        return this.httpRequest.send(action, { appid: appid, loginType: loginType });
    };
    return default_1;
}());
exports.default = default_1;
