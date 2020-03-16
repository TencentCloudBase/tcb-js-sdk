import { getRequestByEnvId } from '../lib/request';
import { createPromiseCallback } from '../lib/util';

interface ICallFunctionOptions {
  name: string;
  data: Record<string, any>;
  query: Record<string, any>;
  search: string;
  parse: boolean;
}

interface ICallFunctionResponse {
  requestId: string;
  result: any;
}

type CallbackFunction = (error: Error, res?: ICallFunctionResponse) => {};

export const callFunction = function(
  { name, data, query, parse, search }: ICallFunctionOptions,
  callback?: CallbackFunction
) {
  const promisedCallback = callback || createPromiseCallback();
  let jsonData;
  try {
    jsonData = data ? JSON.stringify(data) : '';
  } catch (e) {
    return Promise.reject(e);
  }
  if (!name) {
    return Promise.reject(new Error('函数名不能为空'));
  }

  const action = 'functions.invokeFunction';
  const params = {
    inQuery: query,
    parse,
    search,
    function_name: name,
    request_data: jsonData
  };
  const request = getRequestByEnvId(this.config.env);
  request
    .send(action, params)
    .then((res) => {
      if (res.code) {
        promisedCallback(null, res);
      } else {
        let result = res.data.response_data;
        // parse 为 true 时服务端解析 JSON，SDK 不再次解析
        if (parse) {
          promisedCallback(null, {
            result,
            requestId: res.requestId
          });
        } else {
          try {
            result = JSON.parse(res.data.response_data);
            promisedCallback(null, {
              result,
              requestId: res.requestId
            });
          } catch (e) {
            promisedCallback(new Error('response data must be json'));
          }
        }
      }

      return promisedCallback.promise;
    })
    .catch((err) => {
      promisedCallback(err);
    });

  return promisedCallback.promise;
};
