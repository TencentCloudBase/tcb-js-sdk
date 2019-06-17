export interface Config {
    env?: string;
    token?: string;
    timeout?: number;
    proxy?: string;
    persistence?: string;
}
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
export declare const ACCESS_TOKEN = "access_token";
export declare const ACCESS_TOKEN_Expire = "access_token_expire";
export declare const REFRESH_TOKEN = "refresh_token";
export declare const BASE_URL = "//212.129.229.68/web";
export {};
