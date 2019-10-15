/*eslint-disable */
export const enum RequestMode {
  WEB = 'WEB',
  WX_MINIAPP = 'WX_MINIAPP'
}
/*eslint-enable */
export interface Config {
  env?: string;
  token?: string;
  timeout?: number;
  proxy?: string;
  persistence?: string;
  mode?: RequestMode;
}

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

export const ACCESS_TOKEN = 'access_token';
export const ACCESS_TOKEN_Expire = 'access_token_expire';
export const REFRESH_TOKEN = 'refresh_token';

// export const BASE_URL = '//118.126.68.63/web';
export const BASE_URL = '//tcb-api.tencentcloudapi.com/web';
// export const BASE_URL = '//localhost:8002/web';
// export const BASE_URL = '//tcb-api.tencentcloudapi.com:8002/web';

// export const BASE_URL = '//212.129.229.68/web';
