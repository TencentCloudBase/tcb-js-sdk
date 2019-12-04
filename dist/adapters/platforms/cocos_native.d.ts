import { SDKAdapterInterface } from '../types';
declare function isCocosNative(): boolean;
declare function genAdapter(): SDKAdapterInterface;
export { genAdapter, isCocosNative };
