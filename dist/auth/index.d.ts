import { Request } from '../lib/request';
import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { AuthProvider } from './base';
import { LoginResult } from './interface';
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
export declare class Auth extends AuthProvider {
    httpRequest: Request;
    config: Config;
    customAuthProvider: AuthProvider;
    _shouldRefreshAccessToken: Function;
    _anonymousAuthProvider: AnonymousAuthProvider;
    constructor(config: Config);
    init(): void;
    weixinAuthProvider({ appid, scope, loginMode, state }: {
        appid: any;
        scope: any;
        loginMode: any;
        state: any;
    }): WeixinAuthProvider;
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
    getAccessToken(): Promise<{
        accessToken: string;
        env: string;
    }>;
    onLoginStateExpire(callback: Function): void;
    getLoginState(): Promise<LoginResult>;
    signInWithTicket(ticket: string): Promise<LoginResult>;
    shouldRefreshAccessToken(hook: any): void;
    getUserInfo(): any;
}
