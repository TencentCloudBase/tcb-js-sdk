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
Object.defineProperty(exports, "__esModule", { value: true });
var Storage = require("./storage");
var auth_1 = require("./auth");
var Functions = require("./functions");
var request_1 = require("./lib/request");
var Db = require('@cloudbase/database').Db;
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
    Db.reqClass = request_1.Request;
    if (!this.authObj) {
        console.warn('需要app.auth()授权');
        return;
    }
    Db.getAccessToken = this.authObj.getAccessToken.bind(this.authObj);
    if (!Db.ws) {
        Db.ws = null;
    }
    return new Db(__assign({}, this.config, dbConfig));
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
function each(obj, fn) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            fn(obj[i], i);
        }
    }
}
function extend(target, source) {
    each(source, function (_val, key) {
        target[key] = source[key];
    });
    return target;
}
extend(TCB.prototype, Functions);
extend(TCB.prototype, Storage);
var tcb = new TCB();
try {
    window.tcb = tcb;
}
catch (e) { }
exports.default = tcb;
module.exports = tcb;
