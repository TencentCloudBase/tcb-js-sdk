import Tcb from '../../src/index';
import * as config from '../config';

describe('storage.uploadFile: 上传文件', () => {
  const app = Tcb.init(config);

  let content = '<a id="a"><b id="b">hey!</b></a>';
  let fileContent = new Blob([content], { type: 'text/xml' });

  it(
    '上传文件、删除文件',
    async () => {
      let result = await app.uploadFile({
        // cloudPath: 'test-admin.jpeg',
        cloudPath: 'a|b.jpeg',
        fileContent
      }, {
        onResponseReceived: (response) => {
          console.log(response);
        }
      });
      console.log(result);
      // assert(result.fileID, '上传文件失败');
      const fileID = result.fileID;
      result = await app.getTempFileURL({
        fileList: [
          {
            fileID: fileID,
            maxAge: 60
          }
        ]
      });
      console.log(result);
      // assert(result.fileList[0].tempFileURL, '获取下载链接失败');

      result = await app.deleteFile({
        fileList: [fileID]
      });
      console.log(JSON.stringify(result));
      // assert(result.fileList[0].fileID, '删除文件失败');
      // assert.strictEqual(fileID, result.fileList[0].fileID);
    },
    10000
  );
});
