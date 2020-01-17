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
var adapter_wx_mp_1 = __importDefault(require("@cloudbase/adapter-wx_mp"));
var auth_1 = require("./auth");
var Storage = __importStar(require("./storage"));
var Functions = __importStar(require("./functions"));
var request_1 = require("./lib/request");
var events_1 = require("./lib/events");
var adapters_1 = require("./adapters");
var types_1 = require("./types");
var util_1 = require("./lib/util");
var cache_1 = require("./lib/cache");
var DEFAULT_INIT_CONFIG = {
    timeout: 15000,
    persistence: 'session'
};
var TCB = (function () {
    function TCB(config) {
        this.config = config ? config : this.config;
        this.authObj = undefined;
    }
    TCB.prototype.init = function (config) {
        if (!adapters_1.Adapter.adapter) {
            this._useDefaultAdapter();
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
        if (adapters_1.Adapter.runtime !== adapters_1.RUNTIME.WEB) {
            database_1.Db.dataVersion = types_1.dataVersion;
            database_1.Db.createSign = util_1.createSign;
            database_1.Db.appSecretInfo = __assign({ appSign: this.config.appSign }, this.config.appSecret);
        }
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
tcb.useAdapters(adapter_wx_mp_1.default);
try {
    window['tcb'] = tcb;
}
catch (e) {
}
module.exports = tcb;
