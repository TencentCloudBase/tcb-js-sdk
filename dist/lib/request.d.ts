import { Config, KV } from '../types';
import { Cache } from './cache';
import { IRequestOptions, SDKRequestInterface, ResponseObject, IUploadRequestOptions } from '@cloudbase/adapter-interface';
interface GetAccessTokenResult {
    accessToken: string;
    accessTokenExpire: number;
}
export declare type CommonRequestOptions = {
    headers?: KV<string>;
    responseType?: string;
    onUploadProgress?: Function;
};
declare class Request {
    config: Config;
    cache: Cache;
    accessTokenKey: string;
    accessTokenExpireKey: string;
    refreshTokenKey: string;
    _shouldRefreshAccessTokenHook: Function;
    _refreshAccessTokenPromise: Promise<GetAccessTokenResult> | null;
    _reqClass: SDKRequestInterface;
    constructor(config?: Config);
    post(options: IRequestOptions): Promise<ResponseObject>;
    upload(options: IUploadRequestOptions): Promise<ResponseObject>;
    download(options: IRequestOptions): Promise<ResponseObject>;
    refreshAccessToken(): Promise<GetAccessTokenResult>;
    _refreshAccessToken(): Promise<GetAccessTokenResult>;
    getAccessToken(): Promise<GetAccessTokenResult>;
    request(action: any, params: any, options?: any): Promise<any>;
    send(action: string, data?: any): Promise<any>;
}
export { Request };
