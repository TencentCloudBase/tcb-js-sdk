import { AuthProvider } from './base';
export declare class AnonymousAuthProvider extends AuthProvider {
    signIn(): Promise<{
        credential: {
            refreshToken: any;
        };
    }>;
    linkAndRetrieveDataWithTicket(ticket: string): Promise<{
        credential: {
            refreshToken: any;
        };
    }>;
    private _setAnonymousUUID;
    private _clearAnonymousUUID;
}
