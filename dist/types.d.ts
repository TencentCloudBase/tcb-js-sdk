export interface Config {
    env?: string;
    appid?: string;
    token?: string;
    traceUser?: boolean;
    timeout?: number;
    proxy?: string;
}
export declare const JWT_KEY = "tcbjwttoken";
export declare const BASE_URL = "http://tcb-web.tencentcloudapi.com:8002/web";
