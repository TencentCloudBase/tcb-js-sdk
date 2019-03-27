// init storage
import * as assert from 'power-assert';
import { isSuccess } from './util';

let fileIdList = [];

export async function uploadFile(app) {
  await app.uploadFile({
    filePath: (<HTMLInputElement>document.getElementById('file')).files[0],
    cloudPath: 'test',
    onUploadProgress: (response) => {
      console.log(response);
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
    onUploadProgress: (response) => {
      console.log(response);
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