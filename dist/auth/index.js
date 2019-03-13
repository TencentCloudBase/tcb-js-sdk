"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../lib/request");
const cache_1 = require("../lib/cache");
class Auth {
    constructor(config) {
        this.httpRequest = new request_1.Request(config);
        this.cache = new cache_1.Cache();
    }
    getUserInfo() {
        const action = 'auth.getUserInfo';
        return this.httpRequest.send(action, {}).then(res => {
            if (res.code) {
                return res;
            }
            else {
                return {
                    requestId: res.requestId
                };
            }
        });
    }
    traceUser() {
        const action = 'auth.traceUser';
        return this.httpRequest.send(action, {});
    }
    getJwt() {
        const action = 'auth.getJwt';
        return this.httpRequest.send(action, {});
    }
}
exports.Auth = Auth;
