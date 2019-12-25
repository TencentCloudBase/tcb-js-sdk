"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var packageInfo = __importStar(require("../package.json"));
exports.SDK_VERISON = packageInfo.version;
exports.ACCESS_TOKEN = 'access_token';
exports.ACCESS_TOKEN_Expire = 'access_token_expire';
exports.REFRESH_TOKEN = 'refresh_token';
exports.ANONYMOUS_UUID = 'anonymous_uuid';
exports.LOGIN_TYPE_KEY = 'login_type';
exports.protocol = typeof location !== 'undefined' && location.protocol === 'http:' ? 'http:' : 'https:';
exports.BASE_URL = process.env.NODE_ENV === 'e2e' && process.env.END_POINT === 'pre'
    ? '//tcb-pre.tencentcloudapi.com/web'
    : '//tcb-api.tencentcloudapi.com/web';
