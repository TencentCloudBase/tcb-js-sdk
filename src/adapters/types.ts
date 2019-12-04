/**
 * runtime环境标识
 * @enum
 */
export enum RUNTIME {
  WEB = 0,
  WX_MP = 1, // 微信小程序
  WX_GAME = 2, // 微信小游戏
  QQ_MP = 3, // QQ小程序
  QQ_GAME = 4, // QQ小游戏
  BD_GAME = 5, // 百度小游戏
  OP_GAME = 6, // OPPO 小游戏
  VV_GAME = 7, // VIVO 小游戏
  COCOS_NATIVE = 8 // COCOS Native
}
/**
 * 请求成功返回对象结构
 * @interface
 */
export interface ResponseObject {
  data? : any;
  statusCode? : number;
  [key: string]: any;
}
/**
 * 请求参数配置
 * @interface
 */
export interface IRequestOptions {
  url? : string;
  data? : object;
  headers? : object;
  method? : string;
  [key: string]: any;
}
/**
 * upload参数file和name必填
 * @interface
 */
export interface IUploadRequestOptions extends IRequestOptions {
  file: string;
  name: string;
  data: {
    success_action_status?: string;
    [key: string]: any;
  };
  onUploadProgress?: (...args: any[]) => void;
}
/**
 * SDK Request实例不需包含send方法
 * @interface
 */
export interface SDKRequestInterface {
  get?: (options: IRequestOptions) => any;
  post: (options: IRequestOptions) => any;
  upload: (options: IRequestOptions) => any;
  download: (options: IRequestOptions) => any;
}
export abstract class AbstractSDKRequest implements SDKRequestInterface {
  abstract post(options: IRequestOptions): any;
  abstract upload(options: IRequestOptions): any;
  abstract download(options: IRequestOptions): any;
}
/**
 * Node环境Request实例仅需包含send方法即可
 * @interface
 */
export interface NodeRequestInterface {
  send: (action: string, data?: any, ...args: any[]) => Promise<any>;
}
/**
 * SDK Request类
 * @interface
 */
export interface SDKRequestConstructor {
  new(options?: any): SDKRequestInterface;
}
/**
 * Node环境的Request类
 * @interface
 */
export interface NodeRequestConstructor {
  new(options: any): NodeRequestInterface;
}
/**
 * WebSocket实例API与规范保持一致
 * @interface
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket}
 */
export interface WebSocketInterface {
  send: (data? : string | ArrayBuffer) => void;
  close: (code? : number, reason? : string) => void;
  onopen: (ev?: any) => void;
  onclose: (ev?: any) => void;
  onerror: (ev?: any) => void;
  onmessage: (ev?: any) => void;
  readyState?: number;
}
/**
 * 创建WebSocket的API与规范保持一致，即使用new
 * @interface
 */
export interface WebSocketContructor {
  new(url: string, ...args: any[]): WebSocketInterface;
}
/**
 * Storage实例API与规范保持一致
 * @interface
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}
 */
export interface StorageInterface {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => any;
  removeItem?: (key: string) => void;
  clear?: () => void;
}
export abstract class AbstractStorage implements StorageInterface {
  abstract setItem(key: string, value: any): void;
  abstract getItem(key: string): any;
}
/**
 * SDK Adapter类
 * @interface
 */
export interface SDKAdapterInterface {
  root: any; // 全局根变量，浏览器环境为window
  wsClass: WebSocketContructor; // WebSocket类
  reqClass: SDKRequestConstructor; // request类
  localStorage?: StorageInterface;
  sessionStorage?: StorageInterface;
}
/**
 * Node Adapter类仅需包含ws和req适配即可
 * @interface
 */
export interface NodeAdapterInterface {
  wsClass: WebSocketContructor;
  reqClass: NodeRequestConstructor;
}