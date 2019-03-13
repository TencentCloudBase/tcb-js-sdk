import { Request } from '../lib/request';
import { Config } from '../types';
import { Cache } from '../lib/cache';
export interface UserInfo {
    openid: string;
    nickname?: string;
    sex?: number;
    province?: string;
    city?: string;
    country?: string;
    headimgurl?: string;
    privilege?: [string];
    unionid?: string;
}
declare class Auth {
    httpRequest: Request;
    cache: Cache;
    constructor(config: Config);
    getUserInfo(): any;
    traceUser(): any;
    getJwt(): any;
}
export { Auth };
