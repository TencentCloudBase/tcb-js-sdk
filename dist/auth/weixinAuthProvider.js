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
        callback = callback || util.createPromiseCallback();
        var accessToken = this.cache.getStore(this.accessTokenKey);
        var accessTokenExpipre = this.cache.getStore(this.accessTokenExpireKey);
        if (accessToken) {
            if (accessTokenExpipre && accessTokenExpipre > Date.now()) {
                callback(0);
                return callback.promise;
            }
            else {
                this.cache.removeStore(this.accessTokenKey);
                this.cache.removeStore(this.accessTokenExpireKey);
            }
        }
        if (Object.values(AllowedScopes).includes(AllowedScopes[this.scope]) === false) {
            throw new Error('错误的scope类型');
        }
        var code = util.getWeixinCode();
        if (!code) {
            return this.redirect();
        }
        callback = callback || util.createPromiseCallback();
        var loginType = this.scope === 'snsapi_login' ? 'WECHAT-OPEN' : 'WECHAT-PUBLIC';
        var promise = this.getJwt(this.appid, loginType, code);
        promise.then(function (res) {
            callback(null, res);
        });
        return callback.promise;
    };
    default_1.prototype.redirect = function () {
        var currUrl = util.removeParam('code', location.href);
        currUrl = util.removeParam('state', currUrl);
        currUrl = encodeURIComponent(currUrl);
        var host = '//open.weixin.qq.com/connect/oauth2/authorize';
        if (this.scope === 'snsapi_login') {
            host = '//open.weixin.qq.com/connect/qrconnect';
        }
        if (LoginModes[this.loginMode] === 'redirect') {
            location.href = host + "?appid=" + this.appid + "&redirect_uri=" + currUrl + "&response_type=code&scope=" + this.scope + "&state=" + this.state + "#wechat_redirect";
        }
    };
    return default_1;
}(base_1.default));
exports.default = default_1;
