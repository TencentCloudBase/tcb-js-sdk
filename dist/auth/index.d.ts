import { Request } from "../lib/request";
import WeixinAuthProvider from "./weixinAuthProvider";
import Base from "./base";
import { Config } from "../types";
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
export default class Auth extends Base {
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
    getAccessToken(): Promise<{}>;
    onLoginStateExpire(callback: Function): void;
    getUserInfo(): any;
}
