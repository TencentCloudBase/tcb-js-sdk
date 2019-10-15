"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cache = (function () {
    function Cache(persistence) {
        switch (persistence) {
            case 'local':
                this.storageClass = localStorage;
                break;
            case 'none':
                this.storageClass = new TcbObject();
                break;
            case 'weixin':
                this.storageClass = new TcbMiniappStorage();
                break;
            default:
                this.storageClass = sessionStorage;
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
var TcbObject = (function () {
    function TcbObject() {
        if (!window['tcbObject']) {
            window['tcbObject'] = {};
        }
    }
    TcbObject.prototype.setItem = function (key, value) {
        window['tcbObject'][key] = value;
    };
    TcbObject.prototype.getItem = function (key) {
        return window['tcbObject'][key];
    };
    TcbObject.prototype.removeItem = function (key) {
        delete window['tcbObject'][key];
    };
    TcbObject.prototype.clear = function () {
        delete window['tcbObject'];
    };
    return TcbObject;
}());
var TcbMiniappStorage = (function () {
    function TcbMiniappStorage() {
    }
    TcbMiniappStorage.prototype.setItem = function (key, value) {
        wx.setStorageSync(key, value);
    };
    TcbMiniappStorage.prototype.getItem = function (key) {
        return wx.getStorageSync(key);
    };
    TcbMiniappStorage.prototype.removeItem = function (key) {
        wx.removeStorageSync(key);
    };
    TcbMiniappStorage.prototype.clear = function () {
        wx.clearStorageSync();
    };
    return TcbMiniappStorage;
}());
