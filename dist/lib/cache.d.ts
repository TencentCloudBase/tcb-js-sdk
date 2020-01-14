import { Config, KV } from '../types';
declare class ICache {
    keys: KV<string>;
    private _persistence;
    private _storage;
    init(config: Config): void;
    updatePersistence(persistence: string): void;
    setStore(key: string, value: any, version?: any): void;
    getStore(key: string, version?: string): any;
    removeStore(key: any): void;
}
declare const cache: ICache;
export { cache };
