// init storage
import * as assert from 'power-assert';
import { isSuccess } from './util';

window['fileIdList'] = [];

export async function uploadFile(app) {
  await app.uploadFile({
    filePath: (<HTMLInputElement>document.getElementById('file')).files[0],
    cloudPath: 'cos.jpeg',
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log({ progress });
    }
  }, function (err, res) {
    let bool = isSuccess(err, res);
    assert(bool, {
      method: 'storage:uploadFile', returnType: 'callback', response: {
        err, res
      }
    });

    if (bool) {
      let fileID = res.fileID;
      if (fileID) {
        window['fileIdList'].push(fileID);
        document.getElementById('fileID').innerHTML = window['fileIdList'].join('<br/>');
      }
    }
  });

  await app.uploadFile({
    filePath: (<HTMLInputElement>document.getElementById('file')).files[0],
    cloudPath: 'cos.jpeg',
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log({ progress });
    }
  }).then(function (err, res) {
    let bool = isSuccess(err, res);
    assert(bool, {
      method: 'storage:uploadFile', returnType: 'promise', response: {
        err, res
      }
    });

    if (bool) {
      let fileID = res.fileID;
      if (fileID) {
        window['fileIdList'].push(fileID);
        document.getElementById('fileID').innerHTML = window['fileIdList'].join('<br/>');
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
  if (!window['fileIdList'].length) {
    alert('Please upload file first.');
    return;
  }

  app.getTempFileURL({
    fileList: window['fileIdList']
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
    fileList: window['fileIdList'].map(fileID => {
      return {
        fileID,
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
  if (!window['fileIdList'].length) {
    alert('Please upload file first.');
    return;
  }
  if (window['fileIdList'].length > 1) {
    console.log('Only the first file will be downloaded.');
  }

  app.downloadFile({
    fileID: window['fileIdList'][0]
  });
}

export async function deleteFile(app) {
  if (!window['fileIdList'].length) {
    alert('Please upload file first.');
    return;
  }

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
      document.getElementById('fileID').innerText = '';
    }
  }).catch(err => {
    assert(false, {
      method: 'storage: deleteFile', response: {
        err
      }
    });
  });
}