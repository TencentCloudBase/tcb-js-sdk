import { Config, KV } from '../types';
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
declare class IRequest {
    config: Config;
    _shouldRefreshAccessTokenHook: Function;
    _refreshAccessTokenPromise: Promise<GetAccessTokenResult> | null;
    _reqClass: SDKRequestInterface;
    private _cache;
    private _localCache;
    constructor(config?: Config);
    post(options: IRequestOptions): Promise<ResponseObject>;
    upload(options: IUploadRequestOptions): Promise<ResponseObject>;
    download(options: IRequestOptions): Promise<ResponseObject>;
    refreshAccessToken(): Promise<GetAccessTokenResult>;
    _refreshAccessToken(): Promise<GetAccessTokenResult>;
    getAccessToken(): Promise<GetAccessTokenResult>;
    request(action: any, params: any, options?: any): Promise<any>;
    send(action: string, data?: any): Promise<any>;
    private setRefreshToken;
}
declare function initRequest(config: Config): void;
declare function getRequestByEnvId(env: string): IRequest;
export { getRequestByEnvId, IRequest, initRequest };
