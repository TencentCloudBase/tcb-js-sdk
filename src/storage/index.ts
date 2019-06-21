import axios, { AxiosResponse } from 'axios';
import { Request } from '../lib/request';
import { createPromiseCallback } from '../lib/util';
import { MetaDataRes } from '../types';


/*
 * 上传文件
 * @param {string} cloudPath 上传后的文件路径
 * @param {fs.ReadStream} filePath  上传文件的临时路径
 */
export const uploadFile = function(
  { cloudPath, filePath, onUploadProgress },
  callback?: any
) {
  callback = callback || createPromiseCallback();

  const metaData = 'storage.getUploadMetadata';

  const httpRequest = new Request(this.config);

  httpRequest
    .send(metaData, {
      path: cloudPath
    })
    .then(metaData => {
      const {
        data: { url, authorization, token, fileId, cosFileId },
        requestId
      }: MetaDataRes = metaData;

      // 使用临时密匙上传文件
      // https://cloud.tencent.com/document/product/436/14048
      const formData: FormData = new FormData();
      formData.append('key', cloudPath);
      formData.append('signature', authorization);
      formData.append('x-cos-meta-fileid', cosFileId);
      formData.append('success_action_status', '201');
      formData.append('x-cos-security-token', token);
      formData.append('file', filePath);
      axios
        .post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress
        })
        .then((res: AxiosResponse) => {
          if (res.status === 201) {
            callback(null, {
              fileID: fileId,
              requestId
            });
          } else {
            callback(new Error('STORAGE_REQUEST_FAIL'));
          }
        })
        .catch(err => {
          callback(err);
        });
    })
    .catch(err => {
      callback(err);
    });

  return callback.promise;
};

/**
 * 删除文件
 * @param {Array.<string>} fileList 文件id数组
 */
export const deleteFile = function({ fileList }, callback?: any) {
  callback = callback || createPromiseCallback();

  if (!fileList || !Array.isArray(fileList)) {
    return {
      code: 'INVALID_PARAM',
      message: 'fileList必须是非空的数组'
    };
  }

  for (let file of fileList) {
    if (!file || typeof file !== 'string') {
      return {
        code: 'INVALID_PARAM',
        message: 'fileList的元素必须是非空的字符串'
      };
    }
  }

  const action = 'storage.batchDeleteFile';
  const params = {
    fileid_list: fileList
  };

  let httpRequest = new Request(this.config);

  httpRequest
    .send(action, params)
    .then(res => {
      if (res.code) {
        callback(null, res);
      } else {
        callback(null, {
          fileList: res.data.delete_list,
          requestId: res.requestId
        });
      }
    })
    .catch(err => {
      callback(err);
    });

  return callback.promise;
};

/**
 * 获取文件下载链接
 * @param {Array.<Object>} fileList
 */
export const getTempFileURL = function({ fileList }, callback?: any) {
  callback = callback || createPromiseCallback();

  if (!fileList || !Array.isArray(fileList)) {
    callback(null, {
      code: 'INVALID_PARAM',
      message: 'fileList必须是非空的数组'
    });
  }

  let file_list = [];
  for (let file of fileList) {
    if (typeof file === 'object') {
      if (!file.hasOwnProperty('fileID') || !file.hasOwnProperty('maxAge')) {
        callback(null, {
          code: 'INVALID_PARAM',
          message: 'fileList的元素必须是包含fileID和maxAge的对象'
        });
      }

      file_list.push({
        fileid: file.fileID,
        max_age: file.maxAge
      });
    } else if (typeof file === 'string') {
      file_list.push({
        fileid: file
      });
    } else {
      callback(null, {
        code: 'INVALID_PARAM',
        message: 'fileList的元素必须是字符串'
      });
    }
  }

  const action = 'storage.batchGetDownloadUrl';

  const params = {
    file_list
  };
  // console.log(params);

  let httpRequest = new Request(this.config);

  httpRequest
    .send(action, params)
    .then(res => {
      // console.log(res);
      if (res.code) {
        callback(null, res);
      } else {
        callback(null, {
          fileList: res.data.download_list,
          requestId: res.requestId
        });
      }
    })
    .catch(err => {
      callback(err);
    });

  return callback.promise;
};

export const downloadFile = function({ fileID }, callback?: any) {
  callback = callback || createPromiseCallback();

  let promise: Promise<any>;

  promise = getTempFileURL.call(this, {
    fileList: [
      {
        fileID,
        maxAge: 600
      }
    ]
  });

  promise.then(tmpUrlRes => {
    const res = tmpUrlRes.fileList[0];

    if (res.code !== 'SUCCESS') {
      callback(res);
      return;
    }

    let tmpUrl = res.download_url;
    tmpUrl = encodeURI(tmpUrl);

    axios
      .get(tmpUrl, {
        responseType: 'blob'
      })
      .then(function(response) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.pdf');
        document.body.appendChild(link);
        link.click();
      });
  });
  return callback.promise;
};
