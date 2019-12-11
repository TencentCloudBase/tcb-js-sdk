import { SDKAdapterInterface, AbstractSDKRequest, IRequestOptions, ResponseObject, IUploadRequestOptions } from '../types';
declare class Request extends AbstractSDKRequest {
    _request(options: IRequestOptions): Promise<ResponseObject>;
    get(options: IRequestOptions): Promise<ResponseObject>;
    post(options: IRequestOptions): Promise<ResponseObject>;
    upload(options: IUploadRequestOptions): Promise<ResponseObject>;
    download(options: IRequestOptions): Promise<void>;
}
declare function genAdapter(): SDKAdapterInterface;
export { genAdapter, Request };
