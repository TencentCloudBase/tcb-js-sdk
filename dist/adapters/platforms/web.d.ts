import { SDKAdapterInterface, AbstractSDKRequest, IRequestOptions, ResponseObject, IUploadRequestOptions } from '@cloudbase/adapter-interface';
declare class WebRequest extends AbstractSDKRequest {
    get(options: IRequestOptions): Promise<ResponseObject>;
    post(options: IRequestOptions): Promise<ResponseObject>;
    upload(options: IUploadRequestOptions): Promise<ResponseObject>;
    download(options: IRequestOptions): Promise<any>;
    protected _request(options: IRequestOptions): Promise<ResponseObject>;
}
declare function genAdapter(): SDKAdapterInterface;
export { genAdapter, WebRequest };
