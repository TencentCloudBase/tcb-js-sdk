import { Config } from '../types';
import { LoginResult } from './interface';
import Base from './base';
export default class extends Base {
    config: Config;
    private scope;
    private appid;
    constructor(config: Config, appid: string, scope: string);
    signIn(): Promise<LoginResult>;
    private _getCode;
}
