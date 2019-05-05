import { Request } from '../lib/request';
import { Cache } from '../lib/cache';
import { Config } from '../types';
export default class {
    httpRequest: Request;
    cache: Cache;
    localKey: string;
    constructor(config: Config);
    protected getJwt(appid: string, loginType?: string): any;
}
