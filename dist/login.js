"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./lib/cache");
const util = require("./lib/util");
const types_1 = require("./types");
const auth_1 = require("./auth");
class Login {
    constructor(config) {
        this.cache = new cache_1.Cache();
        this.config = config;
    }
    checkLogin() {
        let jwt = this.cache.getStore(types_1.JWT_KEY);
        let code = util.getQuery('code');
        if (jwt || code) {
            let promise = Promise.resolve();
            let auth = new auth_1.Auth(this.config);
            if (this.config.traceUser) {
                promise = auth.traceUser();
            }
            else if (!jwt) {
                promise = auth.getJwt();
            }
            return promise.then(res => {
                if (!jwt) {
                    this.cache.setStore(types_1.JWT_KEY, res.token, 7000 * 1000);
                }
                if (res && res.code) {
                    console.error('登录失败，请用户重试');
                }
            });
        }
        const scope = this.config.traceUser ? 'snsapi_userinfo' : 'snsapi_base';
        let currUrl = util.removeParam('code', location.href);
        currUrl = util.removeParam('state', currUrl);
        currUrl = encodeURIComponent(currUrl);
        location.href = '//open.weixin.qq.com/connect/oauth2/authorize?appid=' + this.config.appid +
            '&redirect_uri=' + currUrl +
            '&response_type=code&scope=' + scope + '&state=qqchongzhi#wechat_redirect';
    }
}
exports.default = Login;
