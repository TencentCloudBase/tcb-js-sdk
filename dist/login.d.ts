import { Cache } from './lib/cache';
import { Config } from './types';
export default class Login {
    cache: Cache;
    config: Config;
    constructor(config: Config);
    checkLogin(): Promise<void>;
}
