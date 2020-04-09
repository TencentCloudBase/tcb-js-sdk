import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { LOGINTYPE } from './base';
import { LoginResult } from './interface';
import { Config } from '../types';
import { CustomAuthProvider } from './customAuthProvider';
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
export declare class Auth {
    private config;
    private _cache;
    private _request;
    private _anonymousAuthProvider;
    constructor(config: Config);
    get loginType(): LOGINTYPE;
    weixinAuthProvider({ appid, scope, state }: {
        appid: any;
        scope: any;
        state: any;
    }): WeixinAuthProvider;
    anonymousAuthProvider(): AnonymousAuthProvider;
    customAuthProvider(): CustomAuthProvider;
    signInAnonymously(): Promise<{
        credential: {
            refreshToken: any;
        };
    }>;
    linkAndRetrieveDataWithTicket(ticket: string): Promise<{
        credential: {
            refreshToken: any;
        };
    }>;
    signOut(): Promise<any>;
    onLoginStateChanged(callback: Function): void;
    onLoginStateExpired(callback: Function): void;
    onAccessTokenRefreshed(callback: Function): void;
    onAnonymousConverted(callback: Function): void;
    onLoginTypeChanged(callback: Function): void;
    getAccessToken(): Promise<{
        accessToken: string;
        env: string;
    }>;
    hasLoginState(): LoginResult;
    getLoginState(): Promise<LoginResult>;
    signInWithTicket(ticket: string): Promise<LoginResult>;
    shouldRefreshAccessToken(hook: any): void;
    getUserInfo(): any;
    getAuthHeader(): {
        'x-cloudbase-credentials': string;
    };
    private _onAnonymousConverted;
    private _onLoginTypeChanged;
}
