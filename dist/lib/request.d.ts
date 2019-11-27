import { Config, RequestMode } from '../types';
import { Cache } from './cache';
interface GetAccessTokenResult {
    accessToken: string;
    accessTokenExpire: number;
}
declare class RequestMethods {
    private readonly _mode;
    constructor(mode?: RequestMode);
    post(url: string, data?: KV<any>, options?: KV<any>): Promise<KV<any>>;
    upload(url: string, filePath: string, key: string, data: FormData, options?: KV<any>): Promise<KV<any>>;
    download(url: string): void;
    private _uploadWeb;
    private _uploadWxMiniApp;
    private _downloadWeb;
    private _downloadWxMiniApp;
    private _postWeb;
    private _postWxMiniApp;
}
declare class Request extends RequestMethods {
    config: Config;
    cache: Cache;
    accessTokenKey: string;
    accessTokenExpireKey: string;
    refreshTokenKey: string;
    _shouldRefreshAccessTokenHook: Function;
    _refreshAccessTokenPromise: Promise<GetAccessTokenResult> | null;
    constructor(config?: Config);
    refreshAccessToken(): Promise<GetAccessTokenResult>;
    _refreshAccessToken(): Promise<GetAccessTokenResult>;
    getAccessToken(): Promise<GetAccessTokenResult>;
    request(action: any, params: any, options?: any): Promise<any>;
    send(action: string, data?: any): Promise<any>;
}
export { Request };
