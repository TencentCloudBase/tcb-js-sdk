import { getRequestByEnvId } from '../lib/request';
import { createPromiseCallback } from '../lib/util';
import { MetaDataRes } from '../types';

/*
 * 上传文件
 * @param {string} cloudPath 上传后的文件路径
 * @param {fs.ReadStream} filePath  上传文件的临时路径
 */
export const uploadFile = function (
  params: {
    cloudPath;
    filePath;
    onUploadProgress?;
  },
  callback?: any
) {
  callback = callback || createPromiseCallback();

  const request = getRequestByEnvId(this.config.env);
  const metaData = 'storage.getUploadMetadata';

  const { cloudPath, filePath, onUploadProgress } = params;
  request
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
      const data = {
        key: cloudPath,
        signature: authorization,
        'x-cos-meta-fileid': cosFileId,
        'success_action_status': '201',
        'x-cos-security-token': token
      };
      // @ts-ignore
      request.upload({
        url,
        data,
        file: filePath,
        name: cloudPath,
        onUploadProgress
      }).then((res: any) => {
        if (res.statusCode === 201) {
          callback(null, {
            fileID: fileId,
            requestId
          });
        } else {
          callback(new Error(`STORAGE_REQUEST_FAIL: ${res.data}`));
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
export const deleteFile = function ({ fileList }, callback?: any) {
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
  const request = getRequestByEnvId(this.config.env);
  request
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
export const getTempFileURL = function ({ fileList }, callback?: any) {
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
  const request = getRequestByEnvId(this.config.env);
  request
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

export const downloadFile = async function ({ fileID }, callback?: any) {
  const tmpUrlRes = await getTempFileURL.call(this, {
    fileList: [
      {
        fileID,
        maxAge: 600
      }
    ]
  });

  const res = tmpUrlRes.fileList[0];

  if (res.code !== 'SUCCESS') {
    return callback ? callback(res) : new Promise(resolve => { resolve(res) });
  }
  const request = getRequestByEnvId(this.config.env);
  let tmpUrl = res.download_url;
  tmpUrl = encodeURI(tmpUrl);
  if (callback) {
    const result = await request.download({ url: tmpUrl });
    callback(result);
  } else {
    return request.download({ url: tmpUrl });
  }
};
