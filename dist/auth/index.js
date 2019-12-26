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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var weixinAuthProvider_1 = __importDefault(require("./weixinAuthProvider"));
var anonymousAuthProvider_1 = require("./anonymousAuthProvider");
var base_1 = __importStar(require("./base"));
var events_1 = require("../lib/events");
var Auth = (function (_super) {
    __extends(Auth, _super);
    function Auth(config) {
        var _this = _super.call(this, config) || this;
        _this.config = config;
        return _this;
    }
    Auth.prototype.init = function () {
        _super.prototype.init.call(this);
        this.customAuthProvider = new base_1.default(this.config);
        this.customAuthProvider.init();
    };
    Auth.prototype.weixinAuthProvider = function (_a) {
        var appid = _a.appid, scope = _a.scope, loginMode = _a.loginMode, state = _a.state;
        var provider = new weixinAuthProvider_1.default(this.config, appid, scope, loginMode, state);
        provider.init();
        return provider;
    };
    Auth.prototype.signInAnonymously = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._anonymousAuthProvider) {
                            this._anonymousAuthProvider = new anonymousAuthProvider_1.AnonymousAuthProvider(this.config);
                            this._anonymousAuthProvider.init();
                        }
                        return [4, this._anonymousAuthProvider.signIn()];
                    case 1:
                        result = _a.sent();
                        return [2, result];
                }
            });
        });
    };
    Auth.prototype.linkAndRetrieveDataWithTicket = function (ticket) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._anonymousAuthProvider) {
                            this._anonymousAuthProvider = new anonymousAuthProvider_1.AnonymousAuthProvider(this.config);
                            this._anonymousAuthProvider.init();
                        }
                        return [4, this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(ticket)];
                    case 1:
                        result = _a.sent();
                        return [2, result];
                }
            });
        });
    };
    Auth.prototype.signOut = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cache, refreshTokenKey, accessTokenKey, accessTokenExpireKey, action, refresh_token, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.loginType === base_1.LOGINTYPE.ANONYMOUS) {
                            throw new Error('[tcb-js-sdk] 匿名用户不支持登出操作');
                        }
                        _a = this.httpRequest, cache = _a.cache, refreshTokenKey = _a.refreshTokenKey, accessTokenKey = _a.accessTokenKey, accessTokenExpireKey = _a.accessTokenExpireKey;
                        action = 'auth.logout';
                        refresh_token = cache.getStore(refreshTokenKey);
                        if (!refresh_token) {
                            return [2];
                        }
                        return [4, this.httpRequest.send(action, { refresh_token: refresh_token })];
                    case 1:
                        res = _b.sent();
                        cache.removeStore(refreshTokenKey);
                        cache.removeStore(accessTokenKey);
                        cache.removeStore(accessTokenExpireKey);
                        events_1.activateEvent(events_1.EVENTS.LOGIN_STATE_CHANGED);
                        events_1.activateEvent(events_1.EVENTS.LOGIN_TYPE_CHANGE, base_1.LOGINTYPE.NULL);
                        return [2, res];
                }
            });
        });
    };
    Auth.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = {};
                        return [4, this.httpRequest.getAccessToken()];
                    case 1: return [2, (_a.accessToken = (_b.sent()).accessToken,
                            _a.env = this.config.env,
                            _a)];
                }
            });
        });
    };
    Auth.prototype.onLoginStateExpire = function (callback) {
        events_1.addEventListener('loginStateExpire', callback);
    };
    Auth.prototype.getLoginState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cache, refreshTokenKey, accessTokenKey, refreshToken, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.httpRequest, cache = _a.cache, refreshTokenKey = _a.refreshTokenKey, accessTokenKey = _a.accessTokenKey;
                        refreshToken = cache.getStore(refreshTokenKey);
                        if (!refreshToken) return [3, 5];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4, this.httpRequest.refreshAccessToken()];
                    case 2:
                        _b.sent();
                        return [3, 4];
                    case 3:
                        e_1 = _b.sent();
                        return [2, null];
                    case 4: return [2, {
                            isAnonymous: this.loginType === base_1.LOGINTYPE.ANONYMOUS,
                            credential: {
                                refreshToken: refreshToken,
                                accessToken: cache.getStore(accessTokenKey)
                            }
                        }];
                    case 5: return [2, null];
                }
            });
        });
    };
    Auth.prototype.signInWithTicket = function (ticket) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cache, refreshTokenKey, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof ticket !== 'string') {
                            throw new Error('ticket must be a string');
                        }
                        _a = this.httpRequest, cache = _a.cache, refreshTokenKey = _a.refreshTokenKey;
                        return [4, this.httpRequest.send('auth.signInWithTicket', {
                                ticket: ticket,
                                refresh_token: cache.getStore(refreshTokenKey) || ''
                            })];
                    case 1:
                        res = _b.sent();
                        if (!res.refresh_token) return [3, 3];
                        this.customAuthProvider.setRefreshToken(res.refresh_token);
                        return [4, this.httpRequest.refreshAccessToken()];
                    case 2:
                        _b.sent();
                        events_1.activateEvent(events_1.EVENTS.LOGIN_STATE_CHANGED);
                        events_1.activateEvent(events_1.EVENTS.LOGIN_TYPE_CHANGE, base_1.LOGINTYPE.CUSTOM);
                        return [2, {
                                credential: {
                                    refreshToken: res.refresh_token
                                }
                            }];
                    case 3: throw new Error('[tcb-js-sdk] 自定义登录失败');
                }
            });
        });
    };
    Auth.prototype.shouldRefreshAccessToken = function (hook) {
        this.httpRequest._shouldRefreshAccessTokenHook = hook.bind(this);
    };
    Auth.prototype.getUserInfo = function () {
        var action = 'auth.getUserInfo';
        return this.httpRequest.send(action, {}).then(function (res) {
            if (res.code) {
                return res;
            }
            else {
                return __assign(__assign({}, res.data), { requestId: res.seqId });
            }
        });
    };
    return Auth;
}(base_1.default));
exports.default = Auth;
