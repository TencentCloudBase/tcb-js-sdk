import { Config } from '../types';
import { LoginResult } from './interface';
import { AuthProvider } from './base';
export declare class WeixinAuthProvider extends AuthProvider {
    config: Config;
    private scope;
    private state;
    private appid;
    constructor(config: Config, appid: string, scope: string, state?: string);
    signInWithRedirect(): Promise<any>;
    getRedirectResult(): Promise<{
        credential: {
            refreshToken: string;
        };
    }>;
    signIn(): Promise<LoginResult>;
    private _signIn;
    private redirect;
    private _signInWithCode;
    private getRefreshTokenByWXCode;
}
