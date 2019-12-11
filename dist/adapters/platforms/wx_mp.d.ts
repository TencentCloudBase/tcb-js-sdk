import { SDKAdapterInterface, IRequestOptions, StorageInterface, IUploadRequestOptions, AbstractSDKRequest } from '../types';
declare function isWxMp(): boolean;
export declare class WxRequest extends AbstractSDKRequest {
    post(options: IRequestOptions): Promise<unknown>;
    upload(options: IUploadRequestOptions): Promise<unknown>;
    download(options: IRequestOptions): Promise<unknown>;
}
export declare const wxMpStorage: StorageInterface;
export declare class WxMpWebSocket {
    constructor(url: string, options?: object);
}
declare function genAdapter(): SDKAdapterInterface;
export { genAdapter, isWxMp };
