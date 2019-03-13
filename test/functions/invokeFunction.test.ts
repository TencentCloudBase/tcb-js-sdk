import Tcb from '../../src/index';
import * as config from '../config';

describe('functions.invokeFunction: 执行云函数', () => {
  const app = Tcb.init(config);
  it(
    '执行云函数',
    async () => {
      const result = await app.callFunction({
        name: 'test',
        data: { a: 1 }
      });
      // console.log(result);
      // assert(result.result, '执行云函数失败');
      expect(result).toEqual(expect.objectContaining({ result: expect.anything() }));
    },
    10000
  );
});
