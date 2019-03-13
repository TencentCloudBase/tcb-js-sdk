"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Storage = require("./storage");
const database_1 = require("./database");
const Functions = require("./functions");
const login_1 = require("./login");
function TCB(config) {
    this.config = config ? config : this.config;
}
TCB.prototype.init = function (config) {
    if (!config.appid) {
        throw new Error('缺少必要参数公众号appid，请前往微信公众平台获取');
    }
    this.config = {
        appid: config.appid,
        env: config.env,
        traceUser: config.traceUser === false ? false : true,
        timeout: config.timeout || 15000
    };
    const login = new login_1.default(config);
    login.checkLogin();
    return new TCB(this.config);
};
TCB.prototype.database = function (dbConfig) {
    return new database_1.Db(Object.assign({}, this, dbConfig));
};
function each(obj, fn) {
    for (let i in obj) {
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
if (window === undefined) {
    window.tcb = exports.Tcb = new TCB();
}
else {
    exports.Tcb = new TCB();
}
