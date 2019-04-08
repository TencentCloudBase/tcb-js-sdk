"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cache = (function () {
    function Cache() {
        this.memStoreMap = {};
    }
    Cache.prototype.setStore = function (key, value, cacheTime, version) {
        try {
            if (!window.localStorage) {
                return;
            }
        }
        catch (e) {
            return;
        }
        var content = '';
        if (!cacheTime) {
            return;
        }
        var d = {};
        d.version = 'localCachev1';
        d.dataVersion = version;
        d.cacheTime = ((new Date()).getTime() + (cacheTime ? cacheTime : 0));
        d.content = value;
        content = JSON.stringify(d);
        try {
            this.memStoreMap[key] = content;
            localStorage.setItem(key, content);
        }
        catch (e) {
            return;
        }
        return;
    };
    Cache.prototype.getStore = function (key, version, forceLocal) {
        try {
            if (process && process.env && process.env.tcb_token) {
                return process.env.tcb_token;
            }
            if (!window.localStorage) {
                return false;
            }
        }
        catch (e) {
            return '';
        }
        var content = '';
        if (forceLocal) {
            content = localStorage.getItem(key);
        }
        else {
            content = this.memStoreMap[key] || localStorage.getItem(key);
        }
        if (!content) {
            return '';
        }
        if (content.indexOf('localCachev1') >= 0) {
            var d = JSON.parse(content);
            if (d.dataVersion !== version) {
                return '';
            }
            if (d.cacheTime >= (new Date()).getTime()) {
                return d.content;
            }
            else {
                this.removeStore(key);
                return '';
            }
        }
        else {
            return content;
        }
    };
    Cache.prototype.removeStore = function (key) {
        try {
            if (!window.localStorage) {
                return this;
            }
        }
        catch (e) {
            return this;
        }
        localStorage.removeItem(key);
        this.memStoreMap[key] = undefined;
        delete this.memStoreMap[key];
        return this;
    };
    return Cache;
}());
exports.Cache = Cache;
