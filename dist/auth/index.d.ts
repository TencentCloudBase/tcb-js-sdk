import { Request } from '../lib/request';
import WeixinAuthProvider from './weixinAuthProvider';
import { Config } from '../types';
export interface UserInfo {
    openid: string;
    nickname?: string;
    sex?: number;
    province?: string;
    city?: string;
    country?: string;
    headimgurl?: string;
    privilege?: [string];
    unionid?: string;
}
export default class Auth {
    httpRequest: Request;
    config: Config;
    constructor(config: Config);
    weixinAuthProvider({ appid, scope, loginMode, state }: {
        appid: any;
        scope: any;
        loginMode: any;
        state: any;
    }): WeixinAuthProvider;
    signOut(): Promise<any>;
    onLoginStateExpire(callback: Function): void;
    getUserInfo(): any;
}
