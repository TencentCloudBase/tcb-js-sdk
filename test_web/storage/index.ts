// init storage
import * as assert from 'power-assert';
import { callbackWithTryCatch, catchCallback, isSuccess, register } from '../util';

let fileIdList = [];

export async function uploadFile(app) {
  await app.uploadFile({
    filePath: (<HTMLInputElement>document.getElementById('file')).files[0],
    cloudPath: 'test',
    onUploadProgress: (progressEvent) => {
      let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log('uploadFile progress: ' + percentCompleted, progressEvent);
    }
  }, function (err, res) {
    let bool = isSuccess(err, res);
    assert(bool, {
      method: 'storage:uploadFile', returnType: 'callback', response: {
        err, res
      }
    });

    if (bool) {
      let fileId = res.fileID;
      if (fileId) {
        fileIdList.push(fileId);
        document.getElementById('fileId').innerHTML = fileIdList.join('<br/>');
      }
    }
  });

  await app.uploadFile({
    filePath: (<HTMLInputElement>document.getElementById('file')).files[0],
    cloudPath: 'test',
    onUploadProgress: (progressEvent) => {
      let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log('uploadFile progress: ' + percentCompleted, progressEvent);
    }
  }).then(function (err, res) {
    let bool = isSuccess(err, res);
    assert(bool, {
      method: 'storage:uploadFile', returnType: 'promise', response: {
        err, res
      }
    });

    if (bool) {
      let fileId = res.fileID;
      if (fileId) {
        fileIdList.push(fileId);
        document.getElementById('fileId').innerHTML = fileIdList.join('<br/>');
      }
    }
  }).catch(function (err) {
    assert(false, {
      method: 'storage:uploadFile', returnType: 'promise', response: {
        err
      }
    });
  });
}

export async function getTempFileURL(app) {
  if (!fileIdList.length) {
    alert('Please upload file first.');
    return;
  }

  app.getTempFileURL({
    fileList: fileIdList
  }).then(function (err, res) {
    assert(isSuccess(err, res), {
      method: 'storage:getTempFileUrl', fileListItemType: 'string', response: {
        err,
        res
      }
    });
  }).catch(err => {
    assert(false, {
      method: 'storage:getTempFileUrl', fileListItemType: 'string', response: {
        err
      }
    });
  });

  app.getTempFileURL({
    fileList: fileIdList.map(fileId => {
      return {
        fileId,
        maxAge: 600
      };
    })
  }).then(function (err, res) {
    assert(isSuccess(err, res), {
      method: 'storage: getTempFileUrl', fileListItemType: 'object', response: {
        err,
        res
      }
    });
  }).catch(err => {
    assert(false, {
      method: 'storage: getTempFileUrl', fileListItemType: 'object', response: {
        err
      }
    });
  });
}

export async function downloadFile(app) {
  if (!fileIdList.length) {
    alert('Please upload file first.');
    return;
  }
  if (fileIdList.length > 1) {
    console.log('Only the first file will be downloaded.');
  }

  app.downloadFile({
    fileId: fileIdList[0]
  });
}

export async function deleteFile(app) {
  if (!fileIdList.length) {
    alert('Please upload file first.');
    return;
  }

  app.deleteFile({
    fileList: fileIdList
  }).then(function (err, res) {
    let bool = isSuccess(err, res);
    assert(bool, {
      method: 'storage: deleteFile', response: {
        err,
        res
      }
    });

    if (bool) {

      fileIdList = [];
      document.getElementById('fileId').innerText = '';
    }
  }).catch(err => {
    assert(false, {
      method: 'storage: deleteFile', response: {
        err
      }
    });
  });
}

export function test_storage(app) {
  let file = new File(['foo'], 'foo.txt', {
    type: 'text/plain',
  });

  register('storage: uploadFile, getTempFileURL, downloadFile and deleteFile with callback', async () => {
    await new Promise(resolve => {
      app.uploadFile({
        filePath: file,
        cloudPath: 'test',
        onUploadProgress: (progressEvent) => {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('uploadFile progress: ' + percentCompleted, progressEvent);
        }
      }, async (err, res) => {
        try {
          assert(isSuccess(err, res) && res.fileId, { err, res });

          let fileId = res.fileID;

          await Promise.all([
            new Promise(resolve1 => {
              app.getTempFileURL({ fileList: [fileId] }, callbackWithTryCatch((err, res) => {
                assert(isSuccess(err, res) && res.fileList, { err, res });
              }, () => {
                resolve1();
              }));
            }),
            new Promise(resolve2 => {
              app.downloadFile({ fileId }, callbackWithTryCatch((err, res) => {
                assert(isSuccess(err, res), { err, res });
              }, () => {
                resolve2();
              }));
            })
          ]);

          app.deleteFile({ fileList: [fileId] }, callbackWithTryCatch((err, res) => {
            assert(isSuccess(err, res) && res.fileList, { err, res });
          }));
        } catch (e) {
          catchCallback(e);
        } finally {
          resolve();
        }
      });
    });
  });

  register('storage: uploadFile, getTempFileURL, downloadFile and deleteFile with promise', async () => {
    await new Promise(async resolve => {
      await app.uploadFile({
        filePath: file,
        cloudPath: 'test',
        onUploadProgress: (progressEvent) => {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('uploadFile progress: ' + percentCompleted, progressEvent);
        }
      }).then(async res => {
        try {
          assert(isSuccess(res) && res.fileId, { res });

          let fileId = res.fileID;

          await Promise.all([
            new Promise(resolve1 => {
              app.getTempFileURL({ fileList: [fileId] }).then(callbackWithTryCatch(res => {
                assert(isSuccess(res) && res.fileList, { res });
              }, () => {
                resolve1();
              })).catch(callbackWithTryCatch(err => {
                assert(false, { err });
              }, () => {
                resolve1();
              }));
            }),
            new Promise(resolve2 => {
              app.downloadFile({ fileId }).then(callbackWithTryCatch(res => {
                assert(isSuccess(res), { res });
              }, () => {
                resolve2();
              })).catch(callbackWithTryCatch(err => {
                assert(false, { err });
              }, () => {
                resolve2();
              }));
            })
          ]);

          app.deleteFile({ fileList: [fileId] }).then(callbackWithTryCatch(res => {
            assert(isSuccess(res) && res.fileList, { res });
          })).catch(callbackWithTryCatch(err => {
            assert(isSuccess(res) && res.fileList, { err });
          }));
        } catch (e) {
          catchCallback(e);
        } finally {
          resolve();
        }
      }).catch(callbackWithTryCatch((err) => {
        assert(false, { err });
      }, () => {
        resolve();
      }));
    });
  });
}