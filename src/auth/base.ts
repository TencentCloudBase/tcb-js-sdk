import { Request } from '../lib/request';
import { Cache } from '../lib/cache';
import { JWT_KEY, Config } from '../types';

export default class {
  httpRequest: Request;
  cache: Cache;
  localKey: string;

  constructor(config: Config) {
    this.httpRequest = new Request(config);
    this.cache = new Cache(config.persistence);

    this.localKey = `${JWT_KEY}_${config.env}`;
  }

  protected getJwt(appid: string, loginType?: string): any {
    const action = 'auth.getJwt';

    return this.httpRequest.send(action, { appid, loginType }).then(res => {
      if (res.token) {
        this.cache.setStore(this.localKey, res.token);
      }
      return res;
    });
  }
}