import {
  SDKAdapterInterface,
  AbstractSDKRequest,
  IRequestOptions,
  ResponseObject,
  IUploadRequestOptions
} from '@cloudbase/adapter-interface';
import { protocol } from '../../types';
import { isFormData, formatUrl } from '../../lib/util';

/**
 * @class WebRequest
 */
class WebRequest extends AbstractSDKRequest {
  public get(options: IRequestOptions): Promise<ResponseObject> {
    return this._request({
      ...options,
      method: 'get'
    });
  }
  public post(options: IRequestOptions): Promise<ResponseObject> {
    return this._request({
      ...options,
      method: 'post'
    });
  }
  public upload(options: IUploadRequestOptions): Promise<ResponseObject> {
    const { data, file, name } = options;
    // upload调用data为object类型，在此处转为FormData
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    formData.append('key', name);
    formData.append('file', file);
    return this._request({
      ...options,
      data: formData,
      method: 'post'
    });
  }
  public async download(options: IRequestOptions): Promise<any> {
    /**
     * @todo
     * blob下载文件的方式受CORS限制，暂不可用。
     */
    // const { data } = await this.get({
    //   ...options,
    //   responseType: 'blob'
    // });
    // const url = window.URL.createObjectURL(new Blob([data]));
    const fileName = decodeURIComponent(new URL(options.url).pathname.split('/').pop() || '');
    const link = document.createElement('a');
    link.href = options.url;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    return new Promise(resolve => {
      resolve({
        statusCode: 200,
        tempFilePath: options.url
      });
    });
  }
  protected _request(options: IRequestOptions): Promise<ResponseObject> {
    const method = (String(options.method)).toLowerCase() || 'get';
    return new Promise(resolve => {
      const { url, headers = {}, data, responseType } = options;
      const realUrl = formatUrl(protocol, url, method === 'get' ? data : {});
      const ajax = new XMLHttpRequest();
      ajax.open(method, realUrl);

      responseType && (ajax.responseType = responseType);
      // ajax.setRequestHeader('Accept', 'application/json');
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
}

function genAdapter() {
  const adapter: SDKAdapterInterface = {
    root: window,
    reqClass: WebRequest,
    wsClass: WebSocket,
    localStorage: localStorage,
    sessionStorage: sessionStorage
  };
  return adapter;
}

export { genAdapter, WebRequest };
