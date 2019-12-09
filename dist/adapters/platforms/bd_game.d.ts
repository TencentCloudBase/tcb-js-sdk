import { AbstractSDKRequest, IRequestOptions, IUploadRequestOptions, StorageInterface, SDKAdapterInterface } from '../types';
declare function isBdGame(): boolean;
export declare class BdRequest extends AbstractSDKRequest {
    post(options: IRequestOptions): Promise<unknown>;
    upload(options: IUploadRequestOptions): Promise<unknown>;
    download(options: IRequestOptions): void;
}
export declare const bdMpStorage: StorageInterface;
export declare class BdMpWebSocket {
    constructor(url: string, options?: object);
}
declare function genAdapter(): SDKAdapterInterface;
export { genAdapter, isBdGame };
