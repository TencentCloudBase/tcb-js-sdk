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
var adapters_1 = require("../adapters");
var types_1 = require("../adapters/types");
var Cache = (function () {
    function Cache(persistence) {
        switch (persistence) {
            case 'local':
                this.storageClass = adapters_1.adapter.localStorage || new TcbObject();
                break;
            case 'none':
                this.storageClass = new TcbObject();
                break;
            default:
                this.storageClass = adapters_1.adapter.sessionStorage || new TcbObject();
                break;
        }
    }
    Cache.prototype.setStore = function (key, value, version) {
        try {
            if (!this.storageClass) {
                return;
            }
        }
        catch (e) {
            return;
        }
        var content = '';
        var d = {};
        d.version = version || 'localCachev1';
        d.content = value;
        content = JSON.stringify(d);
        try {
            this.storageClass.setItem(key, content);
        }
        catch (e) {
            return;
        }
        return;
    };
    Cache.prototype.getStore = function (key, version) {
        try {
            if (process && process.env && process.env.tcb_token) {
                return process.env.tcb_token;
            }
            if (!this.storageClass) {
                return;
            }
        }
        catch (e) {
            return '';
        }
        version = version || 'localCachev1';
        var content = this.storageClass.getItem(key);
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
    Cache.prototype.removeStore = function (key) {
        this.storageClass.removeItem(key);
    };
    return Cache;
}());
exports.Cache = Cache;
var TcbObject = (function (_super) {
    __extends(TcbObject, _super);
    function TcbObject() {
        var _this = _super.call(this) || this;
        if (!adapters_1.adapter.root['tcbObject']) {
            adapters_1.adapter.root['tcbObject'] = {};
        }
        return _this;
    }
    TcbObject.prototype.setItem = function (key, value) {
        adapters_1.adapter.root['tcbObject'][key] = value;
    };
    TcbObject.prototype.getItem = function (key) {
        return adapters_1.adapter.root['tcbObject'][key];
    };
    TcbObject.prototype.removeItem = function (key) {
        delete adapters_1.adapter.root['tcbObject'][key];
    };
    TcbObject.prototype.clear = function () {
        delete adapters_1.adapter.root['tcbObject'];
    };
    return TcbObject;
}(types_1.AbstractStorage));
