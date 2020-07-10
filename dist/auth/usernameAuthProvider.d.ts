import { AuthProvider } from './base';
import { LoginResult } from './interface';
export declare class UsernameAuthProvider extends AuthProvider {
    signIn(username: string, password: string): Promise<LoginResult>;
}
