import Base from './base';
import { Config } from '../types';
export declare class AnonymousAuthProvider extends Base {
    private readonly _anonymousUuidKey;
    private readonly _loginTypeKey;
    constructor(config: Config);
    init(): void;
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
    getAllStore(): {};
    private _setAnonymousUUID;
    private _clearAnonymousUUID;
}
