export declare enum RUNTIME {
    WEB = 0,
    WX_MP = 1,
    WX_GAME = 2,
    QQ_MP = 3,
    QQ_GAME = 4,
    BD_GAME = 5,
    OP_GAME = 6,
    VV_GAME = 7,
    COCOS_NATIVE = 8
}
export declare enum StorageType {
    local = "local",
    none = "none",
    session = "session"
}
export interface ResponseObject {
    data?: any;
    statusCode?: number;
    [key: string]: any;
}
export interface IRequestOptions {
    url?: string;
    data?: object;
    headers?: object;
    method?: string;
    [key: string]: any;
}
export interface IUploadRequestOptions extends IRequestOptions {
    file: string;
    name: string;
    data: {
        success_action_status?: string;
        [key: string]: any;
    };
    onUploadProgress?: (...args: any[]) => void;
}
export interface SDKRequestInterface {
    get?: (options: IRequestOptions) => any;
    post: (options: IRequestOptions) => any;
    upload: (options: IRequestOptions) => any;
    download: (options: IRequestOptions) => any;
}
export declare abstract class AbstractSDKRequest implements SDKRequestInterface {
    abstract post(options: IRequestOptions): any;
    abstract upload(options: IRequestOptions): any;
    abstract download(options: IRequestOptions): any;
}
export interface NodeRequestInterface {
    send: (action: string, data?: any, ...args: any[]) => Promise<any>;
}
export interface SDKRequestConstructor {
    new (options?: any): SDKRequestInterface;
}
export interface NodeRequestConstructor {
    new (options: any): NodeRequestInterface;
}
export interface WebSocketInterface {
    send: (data?: string | ArrayBuffer) => void;
    close: (code?: number, reason?: string) => void;
    onopen: any;
    onclose: any;
    onerror: any;
    onmessage: any;
    readyState: number;
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
}
export interface WebSocketContructor {
    new (url: string, ...args: any[]): WebSocketInterface;
}
export interface StorageInterface {
    setItem: (key: string, value: any) => void;
    getItem: (key: string) => any;
    removeItem?: (key: string) => void;
    clear?: () => void;
    [key: string]: any;
}
export declare abstract class AbstractStorage implements StorageInterface {
    abstract setItem(key: string, value: any): void;
    abstract getItem(key: string): any;
}
export interface SDKAdapterInterface {
    root: any;
    wsClass: WebSocketContructor;
    reqClass: SDKRequestConstructor;
    localStorage?: StorageInterface;
    sessionStorage?: StorageInterface;
    primaryStorage?: StorageType;
}
export interface NodeAdapterInterface {
    wsClass: WebSocketContructor;
    reqClass: NodeRequestConstructor;
}
