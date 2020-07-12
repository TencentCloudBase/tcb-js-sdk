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
var database_1 = require("@cloudbase/database");
var cloudbase_adapter_wx_mp_1 = __importDefault(require("cloudbase-adapter-wx_mp"));
var auth_1 = require("./auth");
var Storage = __importStar(require("./storage"));
var Functions = __importStar(require("./functions"));
var request_1 = require("./lib/request");
var events_1 = require("./lib/events");
var adapters_1 = require("./adapters");
var cache_1 = require("./lib/cache");
var DEFAULT_INIT_CONFIG = {
    timeout: 15000,
    persistence: 'session'
};
var MAX_TIMEOUT = 1000 * 60 * 10;
var MIN_TIMEOUT = 100;
var extensionMap = {};
var TCB = (function () {
    function TCB(config) {
        this.config = config ? config : this.config;
        this.authObj = undefined;
        if (adapters_1.Adapter.adapter) {
            this.requestClient = new adapters_1.Adapter.adapter.reqClass({
                timeout: this.config.timeout,
                timeoutMsg: "[tcb-js-sdk] \u8BF7\u6C42\u5728" + this.config.timeout / 1000 + "s\u5185\u672A\u5B8C\u6210\uFF0C\u5DF2\u4E2D\u65AD"
            });
        }
    }
    TCB.prototype.init = function (config) {
        if (!adapters_1.Adapter.adapter) {
            this._useDefaultAdapter();
            this.requestClient = new adapters_1.Adapter.adapter.reqClass({
                timeout: config.timeout || 5000,
                timeoutMsg: "[tcb-js-sdk] \u8BF7\u6C42\u5728" + (config.timeout || 5000) / 1000 + "s\u5185\u672A\u5B8C\u6210\uFF0C\u5DF2\u4E2D\u65AD"
            });
        }
        if (adapters_1.Adapter.runtime !== adapters_1.RUNTIME.WEB) {
            if (!config.appSecret) {
                throw new Error('[tcb-js-sdk]参数错误：请正确配置appSecret');
            }
            var appSign = adapters_1.Adapter.adapter.getAppSign ? adapters_1.Adapter.adapter.getAppSign() : '';
            if (config.appSign && appSign && config.appSign !== appSign) {
                throw new Error('[tcb-js-sdk]参数错误：非法的应用标识');
            }
            appSign && (config.appSign = appSign);
            if (!config.appSign) {
                throw new Error('[tcb-js-sdk]参数错误：请正确配置应用标识');
            }
        }
        this.config = __assign(__assign({}, DEFAULT_INIT_CONFIG), config);
        switch (true) {
            case this.config.timeout > MAX_TIMEOUT:
                console.warn('[tcb-js-sdk] timeout大于可配置上限[10分钟]，已重置为上限数值');
                this.config.timeout = MAX_TIMEOUT;
                break;
            case this.config.timeout < MIN_TIMEOUT:
                console.warn('[tcb-js-sdk] timeout小于可配置下限[100ms]，已重置为下限数值');
                this.config.timeout = MIN_TIMEOUT;
                break;
        }
        return new TCB(this.config);
    };
    TCB.prototype.database = function (dbConfig) {
        database_1.Db.reqClass = request_1.IRequest;
        database_1.Db.wsClass = adapters_1.Adapter.adapter.wsClass;
        if (!this.authObj) {
            console.warn('需要app.auth()授权');
            return;
        }
        database_1.Db.getAccessToken = this.authObj.getAccessToken.bind(this.authObj);
        database_1.Db.runtime = adapters_1.Adapter.runtime;
        if (!database_1.Db.ws) {
            database_1.Db.ws = null;
        }
        return new database_1.Db(__assign(__assign({}, this.config), dbConfig));
    };
    TCB.prototype.auth = function (_a) {
        var persistence = (_a === void 0 ? {} : _a).persistence;
        if (this.authObj) {
            console.warn('tcb实例只存在一个auth对象');
            return this.authObj;
        }
        var _persistence = persistence || adapters_1.Adapter.adapter.primaryStorage || DEFAULT_INIT_CONFIG.persistence;
        if (_persistence !== this.config.persistence) {
            this.config.persistence = _persistence;
        }
        cache_1.initCache(this.config);
        request_1.initRequest(this.config);
        this.authObj = new auth_1.Auth(this.config);
        return this.authObj;
    };
    TCB.prototype.on = function (eventName, callback) {
        return events_1.addEventListener.apply(this, [eventName, callback]);
    };
    TCB.prototype.off = function (eventName, callback) {
        return events_1.removeEventListener.apply(this, [eventName, callback]);
    };
    TCB.prototype.callFunction = function (params, callback) {
        return Functions.callFunction.apply(this, [params, callback]);
    };
    TCB.prototype.deleteFile = function (params, callback) {
        return Storage.deleteFile.apply(this, [params, callback]);
    };
    TCB.prototype.getTempFileURL = function (params, callback) {
        return Storage.getTempFileURL.apply(this, [params, callback]);
    };
    TCB.prototype.downloadFile = function (params, callback) {
        return Storage.downloadFile.apply(this, [params, callback]);
    };
    TCB.prototype.uploadFile = function (params, callback) {
        return Storage.uploadFile.apply(this, [params, callback]);
    };
    TCB.prototype.getUploadMetadata = function (params, callback) {
        return Storage.getUploadMetadata.apply(this, [params, callback]);
    };
    TCB.prototype.registerExtension = function (ext) {
        extensionMap[ext.name] = ext;
    };
    TCB.prototype.invokeExtension = function (name, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var ext, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ext = extensionMap[name];
                        if (!ext) {
                            throw Error("\u6269\u5C55" + name + " \u5FC5\u987B\u5148\u6CE8\u518C");
                        }
                        return [4, ext.invoke(opts, this)];
                    case 1:
                        res = _a.sent();
                        return [2, res];
                }
            });
        });
    };
    TCB.prototype.useAdapters = function (adapters) {
        var _a = adapters_1.useAdapters(adapters) || {}, adapter = _a.adapter, runtime = _a.runtime;
        adapter && (adapters_1.Adapter.adapter = adapter);
        runtime && (adapters_1.Adapter.runtime = runtime);
    };
    TCB.prototype._useDefaultAdapter = function () {
        var _a = adapters_1.useDefaultAdapter(), adapter = _a.adapter, runtime = _a.runtime;
        adapters_1.Adapter.adapter = adapter;
        adapters_1.Adapter.runtime = runtime;
    };
    return TCB;
}());
var tcb = new TCB();
tcb.useAdapters(cloudbase_adapter_wx_mp_1.default);
try {
    window['tcb'] = tcb;
}
catch (e) {
}
module.exports = tcb;
