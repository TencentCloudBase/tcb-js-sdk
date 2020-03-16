import { Config, KV } from '../types';
export declare class ICache {
    keys: KV<string>;
    private _persistence;
    private _storage;
    constructor(config: Config);
    updatePersistence(persistence: string): void;
    setStore(key: string, value: any, version?: any): void;
    getStore(key: string, version?: string): any;
    removeStore(key: any): void;
}
declare function initCache(config: Config): void;
declare function getCache(env: string): ICache;
export { getCache, initCache };
