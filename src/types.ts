import * as packageInfo from '../package.json';

export const SDK_VERISON = packageInfo.version;

export interface AppSecret {
  appAccessKeyId: string;
  appAccessKey: string;
}
export interface Config {
  env?: string;
  token?: string;
  timeout?: number;
  proxy?: string;
  persistence?: string;
  appSecret?: AppSecret;
  appSign?: string;
}

export type KV<T> = {
  [key: string]: T;
};

interface MetaData {
  url: string;
  token: string;
  authorization: string;
  fileId: string;
  cosFileId: string;
}

export interface MetaDataRes {
  data: MetaData;
  requestId: string;
}

export type LOGIN_TYPE = 'WECHAT-OPEN' | 'WECHAT-PUBLIC' | 'ANONYMOUS' | 'CUSTOM';

export const ACCESS_TOKEN = 'access_token';
export const ACCESS_TOKEN_Expire = 'access_token_expire';
export const REFRESH_TOKEN = 'refresh_token';
export const ANONYMOUS_UUID = 'anonymous_uuid';
export const LOGIN_TYPE_KEY = 'login_type';

export const protocol = typeof location !== 'undefined' && location.protocol === 'http:' ? 'http:' : 'https:';
// debug
// export const protocol = 'http:'

// export const BASE_URL = '//118.126.68.63/web';
export const BASE_URL =
  process.env.NODE_ENV === 'e2e' && process.env.END_POINT === 'pre'
    ? '//tcb-pre.tencentcloudapi.com/web'
    : '//tcb-api.tencentcloudapi.com/web';
// debug
// export const BASE_URL = '//localhost:8002/web';
// export const BASE_URL = '//9.88.239.245/web';
// export const BASE_URL = '//tcb-api.tencentcloudapi.com:8002/web';

// export const BASE_URL = '//212.129.229.68/web';

export const dataVersion = '2020-01-10';