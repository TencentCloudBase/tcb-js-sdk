import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { LOGINTYPE } from './base';
import { LoginResult } from './interface';
import { Config } from '../types';
import { CustomAuthProvider } from './customAuthProvider';
export declare class Auth {
    private config;
    private _cache;
    private _request;
    private _anonymousAuthProvider;
    constructor(config: Config);
    get currentUser(): any;
    get loginType(): LOGINTYPE;
    weixinAuthProvider({ appid, scope, state }: {
        appid: any;
        scope: any;
        state: any;
    }): WeixinAuthProvider;
    anonymousAuthProvider(): AnonymousAuthProvider;
    customAuthProvider(): CustomAuthProvider;
    signInAnonymously(): Promise<LoginState>;
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
    hasLoginState(): LoginState;
    getLoginState(): Promise<LoginState>;
    signInWithTicket(ticket: string): Promise<LoginResult>;
    shouldRefreshAccessToken(hook: any): void;
    getUserInfo(): any;
    getAuthHeader(): {
        'x-cloudbase-credentials': string;
    };
    private _onAnonymousConverted;
    private _onLoginTypeChanged;
}
export declare class User {
    private _cache;
    private _request;
    private _envId;
    constructor(envId: string);
    get uid(): string;
    get loginType(): string;
    get openid(): string;
    get unionId(): string;
    get qqMiniOpenId(): string;
    get nickName(): string;
    get gender(): string;
    get avatarUrl(): string;
    get location(): {
        country: any;
        province: any;
        city: any;
    };
    linkWithTicket(ticket: string): Promise<any>;
    linkWithRedirect(provider: any): void;
    getLinkedUidList(): Promise<{
        users: any;
        hasPrimaryUid: boolean;
    }>;
    setPrimaryUid(uid: any): Promise<any>;
    unlink(platform: any): Promise<any>;
    update(userInfo: any): Promise<void>;
    refresh(): Promise<any>;
    private setLocalUserInfo;
    private getLocalUserInfo;
}
export declare class LoginState {
    credential: any;
    loginType: any;
    user: any;
    private _cache;
    constructor(envId: any);
    get isAnonymousAuth(): boolean;
    get isCustomAuth(): boolean;
    get isWeixinAuth(): boolean;
}
