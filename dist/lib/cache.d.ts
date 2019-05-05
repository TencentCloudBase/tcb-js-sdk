declare class Cache {
    storageClass: any;
    constructor(persistence: string);
    setStore(key: string, value: any, version?: any): void;
    getStore(key: string, version?: string): any;
    removeStore(key: any): void;
}
export { Cache };
