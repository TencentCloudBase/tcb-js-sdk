import { IRequest } from '../lib/request';
import { ICache } from '../lib/cache';
import { Config } from '../types';
export declare enum LOGINTYPE {
    ANONYMOUS = "ANONYMOUS",
    WECHAT = "WECHAT",
    WECHAT_PUBLIC = "WECHAT-PUBLIC",
    WECHAT_OPEN = "WECHAT-OPEN",
    CUSTOM = "CUSTOM",
    NULL = "NULL"
}
export declare class AuthProvider {
    config: Config;
    protected readonly _cache: ICache;
    protected readonly _request: IRequest;
    constructor(config: Config);
    protected setRefreshToken(refreshToken: any): void;
    protected refreshUserInfo(): Promise<any>;
    protected setLocalUserInfo(userInfo: any): void;
}
