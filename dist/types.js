"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var packageInfo = require("../package.json");
exports.SDK_VERISON = packageInfo.version;
exports.ACCESS_TOKEN = 'access_token';
exports.ACCESS_TOKEN_Expire = 'access_token_expire';
exports.REFRESH_TOKEN = 'refresh_token';
exports.BASE_URL = process.env.NODE_ENV === 'e2e' && process.env.END_POINT === 'pre'
    ? '//tcb-pre.tencentcloudapi.com/web'
    : '//tcb-api.tencentcloudapi.com/web';
