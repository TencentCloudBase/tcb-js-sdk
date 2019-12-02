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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var url = __importStar(require("url"));
var types_1 = require("../types");
var cache_1 = require("./cache");
var events_1 = require("./events");
var axios_1 = __importDefault(require("axios"));
var actionsWithoutAccessToken = [
    'auth.getJwt',
    'auth.logout',
    'auth.signInWithTicket'
];
var commonHeader = {
    'X-SDK-Version': types_1.SDK_VERISON
};
var RequestMethods = (function () {
    function RequestMethods(mode) {
        if (mode === void 0) { mode = "WEB"; }
        this._mode = mode;
    }
    RequestMethods.prototype.post = function (url, data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var res, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._mode;
                        switch (_a) {
                            case "WEB": return [3, 1];
                            case "WX_MINIAPP": return [3, 3];
                        }
                        return [3, 5];
                    case 1:
                        options.headers = __assign({}, options.headers, commonHeader);
                        return [4, this._postWeb("" + types_1.protocol + url, data, options)];
                    case 2:
                        res = _b.sent();
                        return [3, 5];
                    case 3: return [4, this._postWxMiniApp("https:" + url, data, {
                            header: __assign({}, options.headers, commonHeader)
                        })];
                    case 4:
                        res = _b.sent();
                        return [3, 5];
                    case 5: return [2, res];
                }
            });
        });
    };
    RequestMethods.prototype.upload = function (url, filePath, key, data, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var res, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._mode;
                        switch (_a) {
                            case "WEB": return [3, 1];
                            case "WX_MINIAPP": return [3, 3];
                        }
                        return [3, 5];
                    case 1:
                        options.headers = __assign({}, options.headers, commonHeader);
                        data.append('file', filePath);
                        data.append('key', key);
                        return [4, this._uploadWeb("" + types_1.protocol + url, data, options)];
                    case 2:
                        res = _b.sent();
                        return [3, 5];
                    case 3: return [4, this._uploadWxMiniApp("https:" + url, filePath, key, data, {
                            header: __assign({}, options.headers, commonHeader)
                        })];
                    case 4:
                        res = _b.sent();
                        return [3, 5];
                    case 5: return [2, res];
                }
            });
        });
    };
    RequestMethods.prototype.download = function (url) {
        switch (this._mode) {
            case "WEB":
                this._downloadWeb("" + types_1.protocol + url);
                break;
            case "WX_MINIAPP":
                this._downloadWxMiniApp(url);
                break;
        }
    };
    RequestMethods.prototype._uploadWeb = function (url, data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return axios_1.default.post(url, data, options);
    };
    RequestMethods.prototype._uploadWxMiniApp = function (url, filePath, key, formData, options) {
        if (formData === void 0) { formData = {}; }
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve) {
            wx.uploadFile(__assign({ url: url,
                filePath: filePath, name: key, formData: formData }, options, { success: function (res) {
                    resolve(res);
                },
                fail: function (err) {
                    resolve(err);
                } }));
        });
    };
    RequestMethods.prototype._downloadWeb = function (url) {
        var fileName = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
        axios_1.default
            .get(url, {
            responseType: 'blob',
            headers: commonHeader
        })
            .then(function (response) {
            var url = window.URL.createObjectURL(new Blob([response.data]));
            var link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        });
    };
    RequestMethods.prototype._downloadWxMiniApp = function (url) {
        wx.downloadFile({
            url: url,
            header: commonHeader
        });
    };
    RequestMethods.prototype._postWeb = function (url, data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return axios_1.default.post(url, data, options);
    };
    RequestMethods.prototype._postWxMiniApp = function (url, data, options) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            wx.request(__assign({ url: url,
                data: data, method: 'POST' }, options, { success: function (res) {
                    resolve(res);
                },
                fail: function (err) {
                    reject(err);
                } }));
        });
    };
    return RequestMethods;
}());
var DEFAULT_REQUEST_CONFIG = {
    mode: "WEB"
};
var Request = (function (_super) {
    __extends(Request, _super);
    function Request(config) {
        if (config === void 0) { config = DEFAULT_REQUEST_CONFIG; }
        var _this = _super.call(this, config.mode) || this;
        _this.config = config;
        _this.cache = new cache_1.Cache(config.persistence);
        _this.accessTokenKey = types_1.ACCESS_TOKEN + "_" + config.env;
        _this.accessTokenExpireKey = types_1.ACCESS_TOKEN_Expire + "_" + config.env;
        _this.refreshTokenKey = types_1.REFRESH_TOKEN + "_" + config.env;
        return _this;
    }
    Request.prototype.refreshAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._refreshAccessTokenPromise) {
                            this._refreshAccessTokenPromise = this._refreshAccessToken();
                        }
                        return [4, this._refreshAccessTokenPromise];
                    case 1:
                        result = _a.sent();
                        this._refreshAccessTokenPromise = null;
                        this._shouldRefreshAccessTokenHook = null;
                        return [2, result];
                }
            });
        });
    };
    Request.prototype._refreshAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var refreshToken, response, code;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.cache.removeStore(this.accessTokenKey);
                        this.cache.removeStore(this.accessTokenExpireKey);
                        refreshToken = this.cache.getStore(this.refreshTokenKey);
                        if (!refreshToken) {
                            throw new Error('[tcb-js-sdk] 未登录CloudBase');
                        }
                        return [4, this.request('auth.getJwt', {
                                refresh_token: refreshToken
                            })];
                    case 1:
                        response = _a.sent();
                        if (response.data.code) {
                            code = response.data.code;
                            if (code === 'SIGN_PARAM_INVALID' || code === 'REFRESH_TOKEN_EXPIRED' || code === 'INVALID_REFRESH_TOKEN') {
                                events_1.activateEvent('loginStateExpire');
                                this.cache.removeStore(this.refreshTokenKey);
                            }
                            throw new Error("[tcb-js-sdk] \u5237\u65B0access token\u5931\u8D25\uFF1A" + response.data.code);
                        }
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
            var accessToken, accessTokenExpire, shouldRefreshAccessToken, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accessToken = this.cache.getStore(this.accessTokenKey);
                        accessTokenExpire = this.cache.getStore(this.accessTokenExpireKey);
                        shouldRefreshAccessToken = true;
                        _a = this._shouldRefreshAccessTokenHook;
                        if (!_a) return [3, 2];
                        return [4, this._shouldRefreshAccessTokenHook(accessToken, accessTokenExpire)];
                    case 1:
                        _a = !(_b.sent());
                        _b.label = 2;
                    case 2:
                        if (_a) {
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
                }
            });
        });
    };
    Request.prototype.request = function (action, params, options) {
        return __awaiter(this, void 0, void 0, function () {
            var contentType, tmpObj, _a, payload, key, opts, parse, query, formatQuery, newUrl, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contentType = 'application/x-www-form-urlencoded';
                        tmpObj = __assign({ action: action, env: this.config.env, dataVersion: '2019-08-16' }, params);
                        if (!(actionsWithoutAccessToken.indexOf(action) === -1)) return [3, 2];
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
                        parse = params.parse, query = params.query;
                        formatQuery = {
                            env: this.config.env
                        };
                        parse && (formatQuery.parse = true);
                        query && (formatQuery = __assign({}, query, formatQuery));
                        newUrl = url.format({
                            pathname: types_1.BASE_URL,
                            query: formatQuery
                        });
                        return [4, this.post(newUrl, payload, opts)];
                    case 3:
                        res = _b.sent();
                        if ((Number(res.status) !== 200 && Number(res.statusCode) !== 200) || !res.data) {
                            throw new Error('network request error');
                        }
                        return [2, res];
                }
            });
        });
    };
    Request.prototype.send = function (action, data) {
        if (data === void 0) { data = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var slowQueryWarning, response, response_1;
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
                        if (!(response.data.code === 'ACCESS_TOKEN_EXPIRED' && actionsWithoutAccessToken.indexOf(action) === -1)) return [3, 4];
                        return [4, this.refreshAccessToken()];
                    case 2:
                        _a.sent();
                        return [4, this.request(action, data, { onUploadProgress: data.onUploadProgress })];
                    case 3:
                        response_1 = _a.sent();
                        if (response_1.data.code) {
                            throw new Error("[" + response_1.data.code + "] " + response_1.data.message);
                        }
                        return [2, response_1.data];
                    case 4:
                        if (response.data.code) {
                            throw new Error("[" + response.data.code + "] " + response.data.message);
                        }
                        return [2, response.data];
                }
            });
        });
    };
    return Request;
}(RequestMethods));
exports.Request = Request;
