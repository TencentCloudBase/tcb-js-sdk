"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var web_1 = require("./web");
function isCocosNative() {
    if (typeof cc === 'undefined') {
        return false;
    }
    if (typeof WebSocket === 'undefined') {
        return false;
    }
    if (typeof XMLHttpRequest === 'undefined') {
        return false;
    }
    if (!cc.game) {
        return false;
    }
    if (typeof cc.game.on !== 'function') {
        return false;
    }
    if (!cc.game.EVENT_HIDE) {
        return false;
    }
    if (!cc.game.EVENT_SHOW) {
        return false;
    }
    if (!cc.sys) {
        return false;
    }
    if (!cc.sys.isNative) {
        return false;
    }
    return true;
}
exports.isCocosNative = isCocosNative;
var ccStorage = {
    setItem: function (key, value) {
        cc.sys.localStorage.setItem(key, value);
    },
    getItem: function (key) {
        return cc.sys.localStorage.getItem(key);
    },
    removeItem: function (key) {
        cc.sys.localStorage.removeItem(key);
    },
    clear: function () {
        cc.sys.localStorage.clear();
    }
};
function genAdapter() {
    var adapter = {
        root: window,
        reqClass: web_1.Request,
        wsClass: WebSocket,
        localStorage: ccStorage
    };
    return adapter;
}
exports.genAdapter = genAdapter;
