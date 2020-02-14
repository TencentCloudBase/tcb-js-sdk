import { getRequestByEnvId } from './request';

/**
 * 扩展模块的请求类
 *
 */
export class ExtRequest {

  _tcbRequest: any

  /**
   * 初始化
   *
   * @internal
   * @param config
   */
  constructor(config) {
    this._tcbRequest = getRequestByEnvId(config.env);
  }

  /**
   * 发送 tcb 请求
   *
   * @param api   - 接口
   * @param data  - 参数
   */
  async tcbRequest(api, data) {

    let res = await this._tcbRequest.send(api, data);
    return res;
  }

  /**
   * 发送普通请求
   * @param {*} opts
   */
  async rawRequest(opts) {
    let res = await this._tcbRequest._reqClass._request(opts);

    return res;
  }
}
