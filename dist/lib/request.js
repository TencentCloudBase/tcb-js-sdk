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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var types_1 = require("../types");
var cache_1 = require("./cache");
var events_1 = require("./events");
var Request = (function () {
    function Request(config) {
        this.config = config;
        this.cache = new cache_1.Cache(config.persistence);
        this.accessTokenKey = types_1.ACCESS_TOKEN + "_" + config.env;
        this.accessTokenExpireKey = types_1.ACCESS_TOKEN_Expire + "_" + config.env;
        this.refreshTokenKey = types_1.REFRESH_TOKEN + "_" + config.env;
    }
    Request.prototype.refreshAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var refreshToken, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.cache.removeStore(this.accessTokenKey);
                        this.cache.removeStore(this.accessTokenExpireKey);
                        refreshToken = this.cache.getStore(this.refreshTokenKey);
                        if (!refreshToken) {
                            throw Error('[tcb-js-sdk] 未登录CloudBase');
                        }
                        return [4, this.request('auth.getJwt', {
                                refresh_token: refreshToken
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.data.access_token) {
                            events_1.activateEvent('refreshAccessToken');
                            this.cache.setStore(this.accessTokenKey, response.data.access_token);
                            this.cache.setStore(this.accessTokenExpireKey, response.data.access_token_expire + Date.now());
                            return [2, {
                                    accessToken: response.data.access_token,
                                    accessTokenExpire: response.data.access_token_expire
                                }];
                        }
                        return [2];
                }
            });
        });
    };
    Request.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accessToken, accessTokenExpire, shouldRefreshAccessToken;
            return __generator(this, function (_a) {
                accessToken = this.cache.getStore(this.accessTokenKey);
                accessTokenExpire = this.cache.getStore(this.accessTokenExpireKey);
                shouldRefreshAccessToken = true;
                if (this._shouldRefreshAccessTokenHook && !this._shouldRefreshAccessTokenHook(accessToken, accessTokenExpire)) {
                    shouldRefreshAccessToken = false;
                }
                if ((!accessToken || !accessTokenExpire || accessTokenExpire < Date.now()) && shouldRefreshAccessToken) {
                    return [2, this.refreshAccessToken()];
                }
                else {
                    return [2, {
                            accessToken: accessToken,
                            accessTokenExpire: accessTokenExpire
                        }];
                }
                return [2];
            });
        });
    };
    Request.prototype.request = function (action, params, options, retryTimes) {
        if (retryTimes === void 0) { retryTimes = 5; }
        return __awaiter(this, void 0, void 0, function () {
            var contentType, tmpObj, _a, payload, key, opts, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (retryTimes < 0) {
                            events_1.activateEvent('LoginStateExpire');
                            console.error('[tcb-js-sdk] 登录态请求循环尝试次数超限');
                            throw new Error('LoginStateExpire');
                        }
                        contentType = 'application/x-www-form-urlencoded';
                        tmpObj = __assign({ action: action, env: this.config.env, dataVersion: '2019-05-30' }, params);
                        if (!(action !== 'auth.getJwt' && action !== 'auth.logout' && action !== 'auth.signInWithTicket')) return [3, 2];
                        _a = tmpObj;
                        return [4, this.getAccessToken()];
                    case 1:
                        _a.access_token = (_b.sent()).accessToken;
                        _b.label = 2;
                    case 2:
                        if (action === 'storage.uploadFile') {
                            payload = new FormData();
                            for (key in payload) {
                                if (payload.hasOwnProperty(key) && payload[key] !== undefined) {
                                    payload.append(key, tmpObj[key]);
                                }
                            }
                            contentType = 'multipart/form-data';
                        }
                        else {
                            contentType = 'application/json;charset=UTF-8';
                            payload = tmpObj;
                        }
                        opts = {
                            headers: {
                                'content-type': contentType
                            },
                        };
                        if (options && options['onUploadProgress']) {
                            opts.onUploadProgress = options['onUploadProgress'];
                        }
                        return [4, axios_1.default.post(types_1.BASE_URL, payload, opts)];
                    case 3:
                        res = _b.sent();
                        if (Number(res.status) !== 200 || !res.data) {
                            throw new Error('network request error');
                        }
                        if (!(res.data.code === 'CHECK_LOGIN_FAILED')) return [3, 5];
                        return [4, this.refreshAccessToken()];
                    case 4:
                        _b.sent();
                        return [2, this.request(action, params, options, --retryTimes)];
                    case 5:
                        if (res.data.code) {
                            throw new Error("[" + res.data.code + "] " + res.data.message);
                        }
                        return [2, res];
                }
            });
        });
    };
    Request.prototype.send = function (action, data) {
        return __awaiter(this, void 0, void 0, function () {
            var slowQueryWarning, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        slowQueryWarning = setTimeout(function () {
                            console.warn('Database operation is longer than 3s. Please check query performance and your network environment.');
                        }, 3000);
                        return [4, this.request(action, data, { onUploadProgress: data.onUploadProgress })];
                    case 1:
                        response = _a.sent();
                        clearTimeout(slowQueryWarning);
                        if (response.data.code === 'SIGN_PARAM_INVALID' || response.data.code === 'REFRESH_TOKEN_EXPIRED') {
                            events_1.activateEvent('LoginStateExpire');
                            this.cache.removeStore(this.refreshTokenKey);
                        }
                        return [2, response.data];
                }
            });
        });
    };
    return Request;
}());
exports.Request = Request;
