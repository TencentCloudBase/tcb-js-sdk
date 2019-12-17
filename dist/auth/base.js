"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var cache_1 = require("../lib/cache");
var types_1 = require("../types");
var adapters_1 = require("../adapters");
var default_1 = (function () {
    function default_1(config) {
        this.config = config;
    }
    default_1.prototype.init = function () {
        this.httpRequest = new request_1.Request(this.config);
        this.cache = new cache_1.Cache(this.config.persistence);
        this.accessTokenKey = types_1.ACCESS_TOKEN + "_" + this.config.env;
        this.accessTokenExpireKey = types_1.ACCESS_TOKEN_Expire + "_" + this.config.env;
        this.refreshTokenKey = types_1.REFRESH_TOKEN + "_" + this.config.env;
    };
    default_1.prototype.setRefreshToken = function (refreshToken) {
        this.cache.removeStore(this.accessTokenKey);
        this.cache.removeStore(this.accessTokenExpireKey);
        this.cache.setStore(this.refreshTokenKey, refreshToken);
    };
    default_1.prototype.getRefreshTokenByWXCode = function (appid, loginType, code) {
        return __awaiter(this, void 0, void 0, function () {
            var action, hybridMiniapp;
            return __generator(this, function (_a) {
                action = 'auth.getJwt';
                hybridMiniapp = adapters_1.Adapter.runtime === adapters_1.RUNTIME.WX_MP ? '1' : '0';
                return [2, this.httpRequest.send(action, { appid: appid, loginType: loginType, code: code, hybridMiniapp: hybridMiniapp }).then(function (res) {
                        if (res.code) {
                            throw new Error("[tcb-js-sdk] \u5FAE\u4FE1\u767B\u5F55\u5931\u8D25: " + res.code);
                        }
                        if (res.refresh_token) {
                            return {
                                refreshToken: res.refresh_token,
                                accessToken: res.access_token,
                                accessTokenExpire: res.access_token_expire
                            };
                        }
                        else {
                            throw new Error("[tcb-js-sdk] getJwt\u672A\u8FD4\u56DErefreshToken");
                        }
                    })];
            });
        });
    };
    return default_1;
}());
exports.default = default_1;
