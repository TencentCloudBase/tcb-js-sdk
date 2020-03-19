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
    onLoginStateChanged(callback: any): void;
    onLoginStateExpired(callback: any): void;
    onAccessTokenRefreshed(callback: any): void;
    onAnonymousConverted(callback: any): void;
    onLoginTypeChanged(callback: any): void;
    getAccessToken(): Promise<{
        accessToken: string;
        env: string;
    }>;
    getLoginState(): LoginResult;
    signInWithTicket(ticket: string): Promise<LoginResult>;
    shouldRefreshAccessToken(hook: any): void;
    getUserInfo(): any;
    getAuthHeader(): {
        'x-cloudbase-credentials': string;
    };
    private _onAnonymousConverted;
    private _onLoginTypeChanged;
}
