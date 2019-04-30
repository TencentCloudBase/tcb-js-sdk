"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types");
var util = require("../lib/util");
var base_1 = require("./base");
var AllowedScopes;
(function (AllowedScopes) {
    AllowedScopes["snsapi_base"] = "snsapi_base";
    AllowedScopes["snsapi_userinfo"] = "snsapi_userinfo";
    AllowedScopes["snsapi_login"] = "snsapi_login";
})(AllowedScopes || (AllowedScopes = {}));
var LoginModes;
(function (LoginModes) {
    LoginModes["redirect"] = "redirect";
    LoginModes["prompt"] = "prompt";
})(LoginModes || (LoginModes = {}));
var default_1 = (function (_super) {
    __extends(default_1, _super);
    function default_1(config, appid, scope, loginMode, state) {
        var _this = _super.call(this, config) || this;
        _this.config = config;
        _this.appid = appid;
        _this.scope = scope;
        _this.state = state || 'weixin';
        _this.loginMode = loginMode || 'redirect';
        return _this;
    }
    default_1.prototype.signIn = function (callback) {
        var _this = this;
        callback = callback || util.createPromiseCallback();
        var jwt = this.cache.getStore(types_1.JWT_KEY);
        var code = util.getQuery('code');
        if (jwt) {
            callback(0);
            return callback.promise;
        }
        if (code) {
            var loginType = this.scope === 'snsapi_login' ? 'WECHAT-OPEN' : 'WECHAT-PUBLIC';
            var promise = this.getJwt(this.appid, loginType);
            promise.then(function (res) {
                if (!res || res.code) {
                    callback(new Error('登录失败，请用户重试'));
                }
                else {
                    if (!jwt && res.token) {
                        _this.cache.setStore(types_1.JWT_KEY, res.token, 7000 * 1000);
                    }
                    callback(0, res);
                }
            });
            return callback.promise;
        }
        if (Object.values(AllowedScopes).includes(AllowedScopes[this.scope]) === false) {
            throw new Error('错误的scope类型');
        }
        var currUrl = util.removeParam('code', location.href);
        currUrl = util.removeParam('state', currUrl);
        currUrl = encodeURIComponent(currUrl);
        if (LoginModes[this.loginMode] === 'redirect') {
            location.href = "//open.weixin.qq.com/connect/oauth2/authorize?appid=" + this.appid + "&redirect_uri=" + currUrl + "&response_type=code&scope=" + this.scope + "&state=" + this.state + "#wechat_redirect";
        }
    };
    return default_1;
}(base_1.default));
exports.default = default_1;
