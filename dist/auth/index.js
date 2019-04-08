"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var weixinAuthProvider_1 = require("./weixinAuthProvider");
var Auth = (function () {
    function Auth(config) {
        this.httpRequest = new request_1.Request(config);
        this.config = config;
    }
    Auth.prototype.weixinAuthProvider = function (_a) {
        var appid = _a.appid, scope = _a.scope, loginMode = _a.loginMode, state = _a.state;
        return new weixinAuthProvider_1.default(this.config, appid, scope, loginMode, state);
    };
    Auth.prototype.getUserInfo = function () {
        var action = 'auth.getUserInfo';
        return this.httpRequest.send(action, {}).then(function (res) {
            if (res.code) {
                return res;
            }
            else {
                return {
                    requestId: res.requestId
                };
            }
        });
    };
    return Auth;
}());
exports.default = Auth;
