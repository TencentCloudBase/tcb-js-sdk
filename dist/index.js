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
var database_1 = require("@cloudbase/database");
var Storage = require("./storage");
var auth_1 = require("./auth");
var Functions = require("./functions");
var request_1 = require("./lib/request");
var events_1 = require("./lib/events");
var TCB = (function () {
    function TCB(config) {
        this.config = config ? config : this.config;
        this.authObj = undefined;
    }
    TCB.prototype.init = function (config) {
        this.config = {
            env: config.env,
            timeout: config.timeout || 15000
        };
        return new TCB(this.config);
    };
    TCB.prototype.database = function (dbConfig) {
        database_1.Db.reqClass = request_1.Request;
        if (!this.authObj) {
            console.warn('需要app.auth()授权');
            return;
        }
        database_1.Db.getAccessToken = this.authObj.getAccessToken.bind(this.authObj);
        if (!database_1.Db.ws) {
            database_1.Db.ws = null;
        }
        return new database_1.Db(__assign({}, this.config, dbConfig));
    };
    TCB.prototype.auth = function (_a) {
        var persistence = (_a === void 0 ? {} : _a).persistence;
        if (this.authObj) {
            console.warn('tcb实例只存在一个auth对象');
            return this.authObj;
        }
        Object.assign(this.config, { persistence: persistence || 'session' });
        this.authObj = new auth_1.default(this.config);
        return this.authObj;
    };
    TCB.prototype.on = function (eventName, callback) {
        return events_1.addEventListener.apply(this, [eventName, callback]);
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
    return TCB;
}());
var tcb = new TCB();
try {
    window.tcb = tcb;
}
catch (e) { }
module.exports = tcb;
