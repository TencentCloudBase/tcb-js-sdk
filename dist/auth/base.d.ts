import { Request } from '../lib/request';
import { Cache } from '../lib/cache';
import { Config } from '../types';
export default class {
    httpRequest: Request;
    cache: Cache;
    constructor(config: Config);
    signOut(): void;
    protected getJwt(appid: string, loginType?: string): any;
}
