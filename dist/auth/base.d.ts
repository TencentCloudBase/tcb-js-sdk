import { Config } from '../types';
export declare enum LOGINTYPE {
    ANONYMOUS = "ANONYMOUS",
    WECHAT = "WECHAT",
    CUSTOM = "CUSTOM",
    NULL = "NULL"
}
export declare class AuthProvider {
    config: Config;
    private _loginType;
    constructor(config: Config);
    get loginType(): LOGINTYPE;
    setRefreshToken(refreshToken: any): void;
    getRefreshTokenByWXCode(appid: string, loginType: string, code: string): Promise<{
        refreshToken: string;
        accessToken: string;
        accessTokenExpire: number;
    }>;
    private _onLoginTypeChanged;
}
