import { Config } from '../types';
import { AuthProvider } from './base';
import { LoginState } from './index';
export declare class WeixinAuthProvider extends AuthProvider {
    config: Config;
    private scope;
    private state;
    private appid;
    constructor(config: Config, appid: string, scope: string, state?: string);
    signInWithRedirect(): Promise<any>;
    getRedirectResult(options: {
        withUnionId?: boolean;
        syncUserInfo?: boolean;
    }): Promise<LoginState>;
    getLinkRedirectResult(options?: {
        withUnionId?: boolean;
    }): Promise<any>;
    signIn(options?: {
        withUnionId?: boolean;
        createUser?: boolean;
        syncUserInfo?: boolean;
    }): Promise<LoginState>;
    private checkLocalLoginState;
    private _signIn;
    private redirect;
    private _signInWithCode;
    private getRefreshTokenByWXCode;
}
