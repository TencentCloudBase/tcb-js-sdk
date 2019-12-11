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
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types");
var util_1 = require("../../lib/util");
function isBdGame() {
    if (typeof swan === 'undefined') {
        return false;
    }
    if (!swan.onHide) {
        return false;
    }
    if (!swan.offHide) {
        return false;
    }
    if (!swan.onShow) {
        return false;
    }
    if (!swan.offShow) {
        return false;
    }
    if (!swan.getSystemInfoSync) {
        return false;
    }
    if (!swan.getStorageSync) {
        return false;
    }
    if (!swan.setStorageSync) {
        return false;
    }
    if (!swan.connectSocket) {
        return false;
    }
    if (!swan.request) {
        return false;
    }
    try {
        if (!swan.getSystemInfoSync()) {
            return false;
        }
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isBdGame = isBdGame;
var BdRequest = (function (_super) {
    __extends(BdRequest, _super);
    function BdRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BdRequest.prototype.post = function (options) {
        var url = options.url, data = options.data, headers = options.headers;
        return new Promise(function (resolve, reject) {
            swan.request({
                url: util_1.formatUrl('https:', url),
                data: data,
                method: 'POST',
                header: headers,
                success: function (res) {
                    resolve(res);
                },
                fail: function (err) {
                    reject(err);
                }
            });
        });
    };
    BdRequest.prototype.upload = function (options) {
        return new Promise(function (resolve) {
            var url = options.url, file = options.file, name = options.name, data = options.data, headers = options.headers;
            swan.uploadFile({
                url: util_1.formatUrl('https:', url),
                name: name,
                formData: data,
                filePath: file,
                header: headers,
                success: function (res) {
                    var result = {
                        statusCode: res.statusCode,
                        data: res.data || {}
                    };
                    if (res.statusCode === 200 && data.success_action_status) {
                        result.statusCode = parseInt(data.success_action_status, 10);
                    }
                    resolve(result);
                },
                fail: function (err) {
                    resolve(err);
                }
            });
        });
    };
    BdRequest.prototype.download = function (options) {
        var url = options.url, headers = options.headers;
        swan.downloadFile({
            url: util_1.formatUrl('https:', url),
            header: headers
        });
    };
    return BdRequest;
}(types_1.AbstractSDKRequest));
exports.BdRequest = BdRequest;
exports.bdMpStorage = {
    setItem: function (key, value) {
        swan.setStorageSync(key, value);
    },
    getItem: function (key) {
        return swan.getStorageSync(key);
    },
    removeItem: function (key) {
        swan.removeStorageSync(key);
    },
    clear: function () {
        swan.clearStorageSync();
    }
};
var BdMpWebSocket = (function () {
    function BdMpWebSocket(url, options) {
        if (options === void 0) { options = {}; }
        var READY_STATE = {
            CONNECTING: 0,
            OPEN: 1,
            CLOSING: 2,
            CLOSED: 3,
        };
        var readyState = READY_STATE.CONNECTING;
        var ws = swan.connectSocket(__assign({ url: url }, options));
        var socketTask = {
            set onopen(cb) {
                ws.onOpen(function (e) {
                    readyState = READY_STATE.OPEN;
                    cb && cb(e);
                });
            },
            set onmessage(cb) {
                ws.onMessage(cb);
            },
            set onclose(cb) {
                ws.onClose(function (e) {
                    readyState = READY_STATE.CLOSED;
                    cb && cb(e);
                });
            },
            set onerror(cb) {
                ws.onError(cb);
            },
            send: function (data) { return ws.send({ data: data }); },
            close: function (code, reason) { return ws.close({ code: code, reason: reason }); },
            get readyState() {
                return readyState;
            },
            CONNECTING: READY_STATE.CONNECTING,
            OPEN: READY_STATE.OPEN,
            CLOSING: READY_STATE.CLOSING,
            CLOSED: READY_STATE.CLOSED
        };
        return socketTask;
    }
    return BdMpWebSocket;
}());
exports.BdMpWebSocket = BdMpWebSocket;
function genAdapter() {
    var adapter = {
        root: {},
        reqClass: BdRequest,
        wsClass: BdMpWebSocket,
        localStorage: exports.bdMpStorage
    };
    return adapter;
}
exports.genAdapter = genAdapter;
