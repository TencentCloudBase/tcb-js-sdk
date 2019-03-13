import Tcb from '../../src/index';
import * as config from '../config';

describe('storage.batchDeleteFile: 删除文件', () => {
  const app = Tcb.init(config);

  it('上传文件、获取文件链接', async () => {
    let result = await app.uploadFile({
      // cloudPath: 'test-admin.jpeg',
      cloudPath: 'a|b.jpeg',
      // fileContent
    }, {
      onResponseReceived: (response) => {
        // console.log(response)
      }
    });
    expect(result.fileID).not.toBeNull();
    console.log(result);
    const fileID = result.fileID;
    result = await app.getTempFileURL({
      fileList: [fileID]
    });
    console.log(JSON.stringify(result));
    expect(result.fileList[0].code).toBe('SUCCESS');
  },
  10000
  );
});
