"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var cache_1 = require("../lib/cache");
var types_1 = require("../types");
var default_1 = (function () {
    function default_1(config) {
        this.httpRequest = new request_1.Request(config);
        this.cache = new cache_1.Cache(config.persistence);
        this.localKey = types_1.JWT_KEY + "_" + config.env;
    }
    default_1.prototype.getJwt = function (appid, loginType) {
        var _this = this;
        var action = 'auth.getJwt';
        return this.httpRequest.send(action, { appid: appid, loginType: loginType }).then(function (res) {
            if (res.token) {
                _this.cache.setStore(_this.localKey, res.token);
            }
            return res;
        });
    };
    return default_1;
}());
exports.default = default_1;
