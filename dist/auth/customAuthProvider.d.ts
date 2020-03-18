import { AuthProvider } from './base';
import { LoginResult } from './interface';
export declare class CustomAuthProvider extends AuthProvider {
    signIn(ticket: string): Promise<LoginResult>;
}
