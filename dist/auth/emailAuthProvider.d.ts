import { AuthProvider } from './base';
import { LoginResult } from './interface';
export declare class EmailAuthProvider extends AuthProvider {
    signIn(email: string, password: string): Promise<LoginResult>;
    activate(token: string): Promise<any>;
    resetPasswordWithToken(token: any, newPassword: any): Promise<any>;
}
