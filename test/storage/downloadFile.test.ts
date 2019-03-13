import Tcb from '../../src/index';
import * as config from '../config';

describe('storage.downloadFile: 下载文件', () => {
  const app = Tcb.init(config);
  it(
    '获取文件链接',
    async () => {
      let result = await app.downloadFile({
        fileID: 'cloud://jimmytest-088bef/1534576354877.jpg',
        // tempFilePath: '/Users/jimmyzhang/repo/tcb-admin-node/test/storage/my-photo.png'
      });
      console.log(result);
      // require('fs').writeFileSync('/Users/jimmyzhang/repo/tcb-admin-node/test/storage/my-photo.png', result.fileContent)
      // assert(result, '下载文件结果');
    },
    10000
  );
});
