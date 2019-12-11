import { IRequestOptions, AbstractSDKRequest, IUploadRequestOptions, StorageInterface, SDKAdapterInterface } from '../types';
declare function isQQMp(): boolean;
export declare class QQRequest extends AbstractSDKRequest {
    post(options: IRequestOptions): Promise<unknown>;
    upload(options: IUploadRequestOptions): Promise<unknown>;
    download(options: IRequestOptions): void;
}
export declare const wxMpStorage: StorageInterface;
export declare class QQMpWebSocket {
    constructor(url: string, options?: object);
}
declare function genAdapter(): SDKAdapterInterface;
export { genAdapter, isQQMp };
