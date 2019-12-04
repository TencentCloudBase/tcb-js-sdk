"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RUNTIME;
(function (RUNTIME) {
    RUNTIME[RUNTIME["WEB"] = 0] = "WEB";
    RUNTIME[RUNTIME["WX_MP"] = 1] = "WX_MP";
    RUNTIME[RUNTIME["WX_GAME"] = 2] = "WX_GAME";
    RUNTIME[RUNTIME["QQ_MP"] = 3] = "QQ_MP";
    RUNTIME[RUNTIME["QQ_GAME"] = 4] = "QQ_GAME";
    RUNTIME[RUNTIME["BD_GAME"] = 5] = "BD_GAME";
    RUNTIME[RUNTIME["OP_GAME"] = 6] = "OP_GAME";
    RUNTIME[RUNTIME["VV_GAME"] = 7] = "VV_GAME";
    RUNTIME[RUNTIME["COCOS_NATIVE"] = 8] = "COCOS_NATIVE";
})(RUNTIME = exports.RUNTIME || (exports.RUNTIME = {}));
var AbstractSDKRequest = (function () {
    function AbstractSDKRequest() {
    }
    return AbstractSDKRequest;
}());
exports.AbstractSDKRequest = AbstractSDKRequest;
var AbstractStorage = (function () {
    function AbstractStorage() {
    }
    return AbstractStorage;
}());
exports.AbstractStorage = AbstractStorage;
