import { Request } from '../lib/request';
import { Cache } from '../lib/cache';
import { Config } from '../types';
export declare enum LOGINTYPE {
    ANONYMOUS = "ANONYMOUS",
    WECHAT = "WECHAT",
    CUSTOM = "CUSTOM",
    NULL = "NULL"
}
export default class {
    httpRequest: Request;
    cache: Cache;
    accessTokenKey: string;
    accessTokenExpireKey: string;
    refreshTokenKey: string;
    loginTypeKey: string;
    config: Config;
    private _loginType;
    constructor(config: Config);
    init(): void;
    onLoginTypeChanged(ev: {
        data: LOGINTYPE;
    }): void;
    get loginType(): LOGINTYPE;
    setRefreshToken(refreshToken: any): void;
    getRefreshTokenByWXCode(appid: string, loginType: string, code: string): Promise<{
        refreshToken: string;
        accessToken: string;
        accessTokenExpire: number;
    }>;
}
