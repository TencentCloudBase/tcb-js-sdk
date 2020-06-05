export declare const SDK_VERISON: any;
export interface AppSecret {
    appAccessKeyId: string;
    appAccessKey: string;
}
export interface Config {
    env?: string;
    token?: string;
    timeout?: number;
    proxy?: string;
    persistence?: string;
    appSecret?: AppSecret;
    appSign?: string;
}
export declare type KV<T> = {
    [key: string]: T;
};
interface MetaData {
    url: string;
    token: string;
    authorization: string;
    fileId: string;
    cosFileId: string;
}
export interface MetaDataRes {
    data: MetaData;
    requestId: string;
}
export declare type LOGIN_TYPE = 'WECHAT-OPEN' | 'WECHAT-PUBLIC' | 'ANONYMOUS' | 'CUSTOM';
export declare const ACCESS_TOKEN = "access_token";
export declare const ACCESS_TOKEN_Expire = "access_token_expire";
export declare const REFRESH_TOKEN = "refresh_token";
export declare const ANONYMOUS_UUID = "anonymous_uuid";
export declare const LOGIN_TYPE_KEY = "login_type";
export declare const USER_INFO_KEY = "user_info";
export declare const protocol: string;
export declare const BASE_URL: string;
export declare const dataVersion = "2020-01-10";
export {};
