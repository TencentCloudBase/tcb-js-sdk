import { IRequest } from '../lib/request';
import { ICache } from '../lib/cache';
import { Config } from '../types';
export declare enum LOGINTYPE {
    ANONYMOUS = "ANONYMOUS",
    WECHAT = "WECHAT",
    CUSTOM = "CUSTOM",
    NULL = "NULL"
}
export declare class AuthProvider {
    config: Config;
    protected readonly _cache: ICache;
    protected readonly _request: IRequest;
    constructor(config: Config);
    setRefreshToken(refreshToken: any): void;
    getRefreshTokenByWXCode(appid: string, loginType: string, code: string): Promise<{
        refreshToken: string;
        accessToken: string;
        accessTokenExpire: number;
    }>;
}
