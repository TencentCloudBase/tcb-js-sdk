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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util = __importStar(require("../lib/util"));
var base_1 = require("./base");
var events_1 = require("../lib/events");
var adapters_1 = require("../adapters");
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
var SignInPromiseMap = {};
var WeixinAuthProvider = (function (_super) {
    __extends(WeixinAuthProvider, _super);
    function WeixinAuthProvider(config, appid, scope, loginMode, state) {
        var _this = _super.call(this, config) || this;
        _this.config = config;
        _this.appid = appid;
        _this.scope = adapters_1.Adapter.runtime === adapters_1.RUNTIME.WX_MP ? 'snsapi_base' : scope;
        _this.state = state || 'weixin';
        _this.loginMode = loginMode || 'redirect';
        return _this;
    }
    WeixinAuthProvider.prototype.signIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, err, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!SignInPromiseMap[this.config.env]) {
                            SignInPromiseMap[this.config.env] = this._signIn();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, SignInPromiseMap[this.config.env]];
                    case 2:
                        result = _a.sent();
                        return [3, 4];
                    case 3:
                        e_1 = _a.sent();
                        err = e_1;
                        return [3, 4];
                    case 4:
                        SignInPromiseMap[this.config.env] = null;
                        if (err) {
                            throw err;
                        }
                        return [2, result];
                }
            });
        });
    };
    WeixinAuthProvider.prototype._signIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, accessTokenKey, accessTokenExpireKey, refreshTokenKey, accessToken, accessTokenExpire, code, loginType, refreshTokenRes, refreshToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._cache.keys, accessTokenKey = _a.accessTokenKey, accessTokenExpireKey = _a.accessTokenExpireKey, refreshTokenKey = _a.refreshTokenKey;
                        accessToken = this._cache.getStore(accessTokenKey);
                        accessTokenExpire = this._cache.getStore(accessTokenExpireKey);
                        if (accessToken) {
                            if (accessTokenExpire && accessTokenExpire > Date.now()) {
                                return [2, {
                                        credential: {
                                            accessToken: accessToken,
                                            refreshToken: this._cache.getStore(refreshTokenKey)
                                        }
                                    }];
                            }
                            else {
                                this._cache.removeStore(accessTokenKey);
                                this._cache.removeStore(accessTokenExpireKey);
                            }
                        }
                        if (Object.values(AllowedScopes).includes(AllowedScopes[this.scope]) === false) {
                            throw new Error('错误的scope类型');
                        }
                        if (!(adapters_1.Adapter.runtime === adapters_1.RUNTIME.WX_MP)) return [3, 2];
                        return [4, util.getMiniAppCode()];
                    case 1:
                        code = _b.sent();
                        return [3, 4];
                    case 2: return [4, util.getWeixinCode()];
                    case 3:
                        code = _b.sent();
                        if (!code) {
                            return [2, this.redirect()];
                        }
                        _b.label = 4;
                    case 4:
                        loginType = (function (scope) {
                            switch (scope) {
                                case AllowedScopes.snsapi_login:
                                    return 'WECHAT-OPEN';
                                default:
                                    return 'WECHAT-PUBLIC';
                            }
                        })(this.scope);
                        return [4, this.getRefreshTokenByWXCode(this.appid, loginType, code)];
                    case 5:
                        refreshTokenRes = _b.sent();
                        refreshToken = refreshTokenRes.refreshToken;
                        this._cache.setStore(refreshTokenKey, refreshToken);
                        if (refreshTokenRes.accessToken) {
                            this._cache.setStore(accessTokenKey, refreshTokenRes.accessToken);
                        }
                        if (refreshTokenRes.accessTokenExpire) {
                            this._cache.setStore(accessTokenExpireKey, refreshTokenRes.accessTokenExpire + Date.now());
                        }
                        events_1.activateEvent(events_1.EVENTS.LOGIN_STATE_CHANGED);
                        events_1.activateEvent(events_1.EVENTS.LOGIN_TYPE_CHANGED, { loginType: base_1.LOGINTYPE.WECHAT, persistence: this.config.persistence });
                        return [2, {
                                credential: {
                                    refreshToken: refreshToken
                                }
                            }];
                }
            });
        });
    };
    WeixinAuthProvider.prototype.redirect = function () {
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
    return WeixinAuthProvider;
}(base_1.AuthProvider));
exports.WeixinAuthProvider = WeixinAuthProvider;
