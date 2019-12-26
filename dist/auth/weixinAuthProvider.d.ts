import { Config } from '../types';
import { LoginResult } from './interface';
import Base from './base';
export default class extends Base {
    config: Config;
    private scope;
    private state;
    private loginMode;
    private appid;
    constructor(config: Config, appid: string, scope: string, loginMode?: string, state?: string);
    signIn(): Promise<LoginResult>;
    _signIn(): Promise<LoginResult>;
    redirect(): any;
}
