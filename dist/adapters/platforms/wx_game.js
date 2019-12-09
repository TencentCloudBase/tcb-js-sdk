"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wx_mp_1 = require("./wx_mp");
var types_1 = require("../types");
function isWxGame() {
    if (typeof wx === 'undefined') {
        return false;
    }
    if (typeof GameGlobal === 'undefined') {
        return false;
    }
    if (!wx.onHide) {
        return false;
    }
    if (!wx.offHide) {
        return false;
    }
    if (!wx.onShow) {
        return false;
    }
    if (!wx.offShow) {
        return false;
    }
    if (!wx.getSystemInfoSync) {
        return false;
    }
    if (!wx.getStorageSync) {
        return false;
    }
    if (!wx.setStorageSync) {
        return false;
    }
    if (!wx.connectSocket) {
        return false;
    }
    if (!wx.request) {
        return false;
    }
    try {
        if (!wx.getSystemInfoSync()) {
            return false;
        }
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isWxGame = isWxGame;
function genAdapter() {
    var adapter = {
        root: GameGlobal,
        reqClass: wx_mp_1.WxRequest,
        wsClass: wx_mp_1.WxMpWebSocket,
        localStorage: wx_mp_1.wxMpStorage,
        primaryStorage: types_1.StorageType.local
    };
    return adapter;
}
exports.genAdapter = genAdapter;
