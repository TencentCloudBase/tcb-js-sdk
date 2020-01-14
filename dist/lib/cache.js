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
var adapter_interface_1 = require("@cloudbase/adapter-interface");
var adapters_1 = require("../adapters");
var types_1 = require("../types");
var util_1 = require("util");
var alwaysLocalKeys = ['anonymousUuidKey'];
var TcbObject = (function (_super) {
    __extends(TcbObject, _super);
    function TcbObject() {
        var _this = _super.call(this) || this;
        if (!adapters_1.Adapter.adapter.root['tcbObject']) {
            adapters_1.Adapter.adapter.root['tcbObject'] = {};
        }
        return _this;
    }
    TcbObject.prototype.setItem = function (key, value) {
        adapters_1.Adapter.adapter.root['tcbObject'][key] = value;
    };
    TcbObject.prototype.getItem = function (key) {
        return adapters_1.Adapter.adapter.root['tcbObject'][key];
    };
    TcbObject.prototype.removeItem = function (key) {
        delete adapters_1.Adapter.adapter.root['tcbObject'][key];
    };
    TcbObject.prototype.clear = function () {
        delete adapters_1.Adapter.adapter.root['tcbObject'];
    };
    return TcbObject;
}(adapter_interface_1.AbstractStorage));
function createStorage(persistence, adapter) {
    switch (persistence) {
        case 'local':
            return adapter.localStorage || new TcbObject();
        case 'none':
            return new TcbObject();
        default:
            return adapter.sessionStorage || new TcbObject();
    }
}
var ICache = (function () {
    function ICache() {
        this.keys = {};
    }
    ICache.prototype.init = function (config) {
        if (!this._storage) {
            this._persistence = adapters_1.Adapter.adapter.primaryStorage || config.persistence;
            this._storage = createStorage(this._persistence, adapters_1.Adapter.adapter);
            var accessTokenKey = types_1.ACCESS_TOKEN + "_" + config.env;
            var accessTokenExpireKey = types_1.ACCESS_TOKEN_Expire + "_" + config.env;
            var refreshTokenKey = types_1.REFRESH_TOKEN + "_" + config.env;
            var anonymousUuidKey = types_1.ANONYMOUS_UUID + "_" + config.env;
            var loginTypeKey = types_1.LOGIN_TYPE_KEY + "_" + config.env;
            this.keys = {
                accessTokenKey: accessTokenKey,
                accessTokenExpireKey: accessTokenExpireKey,
                refreshTokenKey: refreshTokenKey,
                anonymousUuidKey: anonymousUuidKey,
                loginTypeKey: loginTypeKey
            };
        }
    };
    ICache.prototype.updatePersistence = function (persistence) {
        if (persistence === this._persistence) {
            return;
        }
        var isCurrentLocal = this._persistence === 'local';
        this._persistence = persistence;
        var storage = createStorage(persistence, adapters_1.Adapter.adapter);
        for (var key in this.keys) {
            var name_1 = this.keys[key];
            if (isCurrentLocal && alwaysLocalKeys.includes(key)) {
                continue;
            }
            var val = this._storage.getItem(name_1);
            if (!util_1.isUndefined(val)) {
                storage.setItem(name_1, val);
                this._storage.removeItem(name_1);
            }
        }
        this._storage = storage;
    };
    ICache.prototype.setStore = function (key, value, version) {
        if (!this._storage) {
            return;
        }
        var d = {
            version: version || 'localCachev1',
            content: value
        };
        var content = JSON.stringify(d);
        try {
            this._storage.setItem(key, content);
        }
        catch (e) {
            return;
        }
        return;
    };
    ICache.prototype.getStore = function (key, version) {
        try {
            if (process && process.env && process.env.tcb_token) {
                return process.env.tcb_token;
            }
            if (!this._storage) {
                return;
            }
        }
        catch (e) {
            return '';
        }
        version = version || 'localCachev1';
        var content = this._storage.getItem(key);
        if (!content) {
            return '';
        }
        if (content.indexOf(version) >= 0) {
            var d = JSON.parse(content);
            return d.content;
        }
        else {
            return '';
        }
    };
    ICache.prototype.removeStore = function (key) {
        this._storage.removeItem(key);
    };
    return ICache;
}());
var cache = new ICache();
exports.cache = cache;
