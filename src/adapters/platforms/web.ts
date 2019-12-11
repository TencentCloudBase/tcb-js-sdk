import {
  SDKAdapterInterface,
  AbstractSDKRequest,
  IRequestOptions,
  ResponseObject,
  IUploadRequestOptions
} from '../types';
import { protocol } from '../../types';
import { isFormData, formatUrl } from '../../lib/util';

class Request extends AbstractSDKRequest {
  _request(options: IRequestOptions): Promise<ResponseObject> {
    const method = (String(options.method)).toLowerCase() || 'get';
    return new Promise(resolve => {
      const { url, headers = {}, data } = options;
      const realUrl = formatUrl(protocol, url, method === 'get' ? data : {});
      const ajax = new XMLHttpRequest();
      ajax.open(method, realUrl);

      ajax.setRequestHeader('Accept', 'application/json');
      for (const key in headers) {
        ajax.setRequestHeader(key, headers[key]);
      }

      ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
          const result: ResponseObject = {
            statusCode: ajax.status
          };
          try {
            // 上传post请求返回数据格式为xml，此处容错
            result.data = JSON.parse(ajax.responseText);
          } catch (e) {}

          resolve(result);
        }
      };
      ajax.send(method === 'post' && isFormData(data) ? (data as FormData) : JSON.stringify(data || {}));
    });
  }
  get(options: IRequestOptions): Promise<ResponseObject> {
    return this._request({
      ...options,
      method: 'get'
    });
  }
  post(options: IRequestOptions): Promise<ResponseObject> {
    return this._request({
      ...options,
      method: 'post'
    });
  }
  upload(options: IUploadRequestOptions): Promise<ResponseObject> {
    const { data, file } = options;
    // upload调用data为object类型，在此处转为FormData
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    formData.append('file', file);
    formData.append('key', name);
    return this._request({
      ...options,
      data: formData,
      method: 'post'
    });
  }
  async download(options: IRequestOptions) {
    const { data } = await this.get(options);
    const fileName = decodeURIComponent(new URL(options.url).pathname.split('/').pop() || '');
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
  }
}

function genAdapter() {
  const adapter: SDKAdapterInterface = {
    root: window,
    reqClass: Request,
    wsClass: WebSocket,
    localStorage: localStorage,
    sessionStorage: sessionStorage
  };
  return adapter;
}

export { genAdapter, Request };