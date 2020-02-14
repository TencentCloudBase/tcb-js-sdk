export declare class ExtRequest {
    _tcbRequest: any;
    constructor(config: any);
    tcbRequest(api: any, data: any): Promise<any>;
    rawRequest(opts: any): Promise<any>;
}
