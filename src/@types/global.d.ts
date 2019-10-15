declare type Weixin = {
  setStorageSync(key: string, val: any): any;
  getStorageSync(key: string): any;
  removeStorageSync(key: string): any;
  clearStorageSync(): void;
  login(options: object): void;
  request(options: object): any;
  uploadFile(options: object): any;
  downloadFile(options: object): any;
}
/*eslint-disable */
declare const wx: Weixin;
/*eslint-enable */
declare type KV<T> = {
  [key: string]: T;
};