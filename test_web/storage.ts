// init storage
import * as assert from 'power-assert';
import { callbackWithTryCatch, catchCallback, isSuccess, register } from './util';

window['fileIdList'] = [];

export async function uploadFile(app, returnType) {
  try {
    switch (returnType) {
      case 'callback': {
        await app.uploadFile({
          filePath: (<HTMLInputElement>document.getElementById('file')).files[0],
          cloudPath: 'cos.jpeg',
          onUploadProgress: (progressEvent) => {
            let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('uploadFile progress: ' + percentCompleted, progressEvent);
          }
        }, function (err, res) {
          let bool = isSuccess(err, res) && res.fileId;
          assert(bool, {
            method: 'storage: uploadFile', returnType: 'callback', err, res
          });

          if (bool) {
            let fileId = res.fileID;
            window['fileIdList'].push(fileId);
            document.getElementById('fileId').innerHTML = window['fileIdList'].join('<br/>');
            document.getElementById('output').innerText = '上传文件 测试成功';
          } else {
            document.getElementById('output').innerText = '上传文件 测试失败';
          }
        });
        break;
      }
      case 'promise': {
        await app.uploadFile({
          filePath: (<HTMLInputElement>document.getElementById('file')).files[0],
          cloudPath: 'cos.jpeg',
          onUploadProgress: (progressEvent) => {
            let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('uploadFile progress: ' + percentCompleted, progressEvent);
          }
        }).then(function (res) {
          let bool = isSuccess(res) && res.fileId;
          assert(bool, {
            method: 'storage: uploadFile', returnType: 'promise', res
          });

          if (bool) {
            let fileId = res.fileID;
            window['fileIdList'].push(fileId);
            document.getElementById('fileId').innerHTML = window['fileIdList'].join('<br/>');
            document.getElementById('output').innerText = '上传文件 测试成功';
          } else {
            document.getElementById('output').innerText = '上传文件 测试失败';
          }
        }).catch(function (err) {
          assert(false, {
            method: 'storage: uploadFile', returnType: 'promise', err
          });
          document.getElementById('output').innerText = '上传文件 测试失败';
        });
        break;
      }
    }
  } catch (e) {
    catchCallback(e);
  }
}

export async function getTempFileURL(app, returnType) {
  if (!window['fileIdList'].length) {
    alert('Please upload file first.');
    return;
  }

  try {
    switch (returnType) {
      case 'callback': {
        app.getTempFileURL({
          fileList: window['fileIdList']
        }, (err, res) => {
          let bool = isSuccess(err, res) && res.fileList.length === window['fileIdList'].length;
          assert(bool, {
            method: 'storage: getTempFileUrl', returnType: 'callback', err, res
          });

          if (bool) {
            document.getElementById('output').innerText = '<p>获取文件下载链接 测试成功</p>' + (res && res.fileList && res.fileList.length
              && res.fileList.map(item => {
                return `<p><a href="${item.tempFileURL}">${item.tempFileURL}</a></p>`;
              }));
          } else {
            document.getElementById('output').innerText = '获取文件下载链接 测试失败';
          }
        });
        break;
      }
      case 'promise': {
        app.getTempFileURL({
          fileList: window['fileIdList']
        }).then(function (res) {
          let bool = isSuccess(res) && res.fileList.length === window['fileIdList'].length;
          assert(bool, {
            method: 'storage: getTempFileUrl', returnType: 'promise', res
          });

          if (bool) {
            document.getElementById('output').innerText = '<p>获取文件下载链接 测试成功</p>' + (res && res.fileList && res.fileList.length
              && res.fileList.map(item => {
                return `<p><a href="${item.tempFileURL}">${item.tempFileURL}</a></p>`;
              }));
          } else {
            document.getElementById('output').innerText = '获取文件下载链接 测试失败';
          }
        }).catch(err => {
          assert(false, {
            method: 'storage: getTempFileUrl', returnType: 'promise', err
          });
          document.getElementById('output').innerText = '获取文件下载链接 测试失败';
        });
      }
    }
  } catch (e) {
    catchCallback(e);
  }
}

//TODO 下载的实现未确定
export async function downloadFile(app) {
  if (!window['fileIdList'].length) {
    alert('Please upload file first.');
    return;
  }
  if (window['fileIdList'].length > 1) {
    console.log('Only the first file will be downloaded.');
  }

  try {
    app.downloadFile({
      fileID: window['fileIdList'][0]
    });
  } catch (e) {
    catchCallback(e);
  }
}

export async function deleteFile(app, returnType) {
  if (!window['fileIdList'].length) {
    alert('Please upload file first.');
    return;
  }

  try {
    switch (returnType) {
      case 'callback': {
        break;
      }
      case 'promise': {
        app.deleteFile({
          fileList: window['fileIdList']
        }).then(function (err, res) {
          let bool = isSuccess(err, res);
          assert(bool, {
            method: 'storage: deleteFile', response: {
              err,
              res
            }
          });

          if (bool) {

            window['fileIdList'] = [];
            document.getElementById('fileId').innerText = '';
          }
        }).catch(err => {
          assert(false, {
            method: 'storage: deleteFile', response: {
              err
            }
          });
        });
        break;
      }
    }
  } catch (e) {
    catchCallback(e);
  }
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
            //TODO 下载的实现未确定
            /*new Promise(resolve2 => {
              app.downloadFile({ fileId }, callbackWithTryCatch((err, res) => {
                assert(isSuccess(err, res), { err, res });
              }, () => {
                resolve2();
              }));
            })*/
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
            //TODO 下载的实现未确定
            /*new Promise(resolve2 => {
              app.downloadFile({ fileId }).then(callbackWithTryCatch(res => {
                assert(isSuccess(res), { res });
              }, () => {
                resolve2();
              })).catch(callbackWithTryCatch(err => {
                assert(false, { err });
              }, () => {
                resolve2();
              }));
            })*/
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