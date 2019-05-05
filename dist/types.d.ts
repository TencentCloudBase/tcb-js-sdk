export interface Config {
    env?: string;
    token?: string;
    timeout?: number;
    proxy?: string;
    persistence?: string;
}
export declare const JWT_KEY = "tcbjwttoken";
export declare const BASE_URL = "http://tcb-api.tencentcloudapi.com/web";
