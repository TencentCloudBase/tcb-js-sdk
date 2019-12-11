import { Config, KV } from '../types';
import { Cache } from './cache';
import { adapter } from '../adapters';
interface GetAccessTokenResult {
    accessToken: string;
    accessTokenExpire: number;
}
export declare type CommonRequestOptions = {
    headers?: KV<string>;
    responseType?: string;
    onUploadProgress?: Function;
};
declare type AppendedRequestInfo = {
    data: KV<any>;
    headers: KV<string>;
};
interface RequestBeforeHook {
    (...args: any[]): AppendedRequestInfo;
}
declare class RequestMethods extends adapter.reqClass {
    constructor();
    static bindHooks(instance: RequestMethods, name: string, hooks: RequestBeforeHook[]): void;
    static beforeEach(): AppendedRequestInfo;
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
