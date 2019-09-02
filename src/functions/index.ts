import { Request } from '../lib/request';
import { createPromiseCallback } from '../lib/util';

export const callFunction = function ({ name, data }, callback?: any): Promise<any> {
  callback = callback || createPromiseCallback();

  try {
    data = data ? JSON.stringify(data) : '';
  } catch (e) {
    return Promise.reject(e);
  }
  if (!name) {
    return Promise.reject(
      new Error('函数名不能为空')
    );
  }

  const action = 'functions.invokeFunction';
  let params = {
    function_name: name,
    request_data: data
  };

  let httpRequest = new Request(this.config);

  httpRequest.send(action, params).then(res => {
    if (res.code) {
      callback(null, res);
    } else {
      let result = res.data.response_data;
      try {
        result = JSON.parse(res.data.response_data);
        callback(null, {
          result,
          requestId: res.requestId
        });
      } catch (e) {
        callback(new Error('response data must be json'));
      }
    }

    return callback.promise;
  }).catch((err) => {
    callback(err);
  });

  return callback.promise;
};