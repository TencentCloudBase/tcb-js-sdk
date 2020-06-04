import { AuthProvider } from './base';
import { LoginState } from './index';
export declare class AnonymousAuthProvider extends AuthProvider {
    signIn(): Promise<LoginState>;
    linkAndRetrieveDataWithTicket(ticket: string): Promise<{
        credential: {
            refreshToken: any;
        };
    }>;
    private _setAnonymousUUID;
    private _clearAnonymousUUID;
}
