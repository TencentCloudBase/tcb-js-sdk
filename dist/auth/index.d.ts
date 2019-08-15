import { Request } from '../lib/request';
import WeixinAuthProvider from './weixinAuthProvider';
import AuthProvider from './base';
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
export default class Auth extends AuthProvider {
    httpRequest: Request;
    config: Config;
    customAuthProvider: AuthProvider;
    _shouldRefreshAccessToken: Function;
    constructor(config: Config);
    weixinAuthProvider({ appid, scope, loginMode, state }: {
        appid: any;
        scope: any;
        loginMode: any;
        state: any;
    }): WeixinAuthProvider;
    signOut(): Promise<any>;
    getAccessToken(): Promise<unknown>;
    onLoginStateExpire(callback: Function): void;
    signInWithTicket(ticket: string): Promise<void>;
    shouldRefreshAccessToken(hook: any): void;
    getUserInfo(): any;
}
