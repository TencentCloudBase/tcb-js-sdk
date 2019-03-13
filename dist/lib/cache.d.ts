declare class Cache {
    memStoreMap: object;
    constructor();
    setStore(key: string, value: any, cacheTime?: number, version?: any): void;
    getStore(key: string, version?: string, forceLocal?: boolean): any;
    removeStore(key: any): this;
}
export { Cache };
