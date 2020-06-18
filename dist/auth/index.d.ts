import { WeixinAuthProvider } from './weixinAuthProvider';
import { AnonymousAuthProvider } from './anonymousAuthProvider';
import { LOGINTYPE } from './base';
import { LoginResult } from './interface';
import { Config } from '../types';
import { CustomAuthProvider } from './customAuthProvider';
import { EmailAuthProvider } from './emailAuthProvider';
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
    emailAuthProvider(): EmailAuthProvider;
    signInAnonymously(): Promise<LoginState>;
    signInWithEmailAndPassword(email: string, password: string): Promise<LoginResult>;
    linkAndRetrieveDataWithTicket(ticket: string): Promise<{
        credential: {
            refreshToken: any;
        };
    }>;
    signOut(): Promise<any>;
    signUpWithEmailAndPassword(email: any, password: any): Promise<any>;
    sendPasswordResetEmail(email: any): Promise<any>;
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
    get wxOpenId(): string;
    get wxPublicId(): string;
    get unionId(): string;
    get qqMiniOpenId(): string;
    get email(): string;
    get hasPassword(): boolean;
    get customUserId(): string;
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
    updatePassword(newPassword: any, oldPassword: any): Promise<any>;
    updateEmail(newEmail: any): Promise<any>;
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
    user: any;
    private _cache;
    constructor(envId: any);
    get isAnonymousAuth(): boolean;
    get isCustomAuth(): boolean;
    get isWeixinAuth(): boolean;
    get loginType(): any;
}
