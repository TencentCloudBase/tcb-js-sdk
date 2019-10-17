import { Db } from '@cloudbase/database';
import Auth from './auth';
declare class TCB {
    config: any;
    authObj: Auth;
    constructor(config?: object);
    init(config: {
        env: string;
        timeout: number;
    }): TCB;
    database(dbConfig?: object): Db;
    auth({ persistence }?: {
        persistence?: string;
    }): Auth;
    on(eventName: string, callback: Function): void;
    callFunction(params: {
        name: string;
        data: any;
    }, callback?: Function): Promise<any>;
    deleteFile(params: {
        fileList: string[];
    }, callback?: Function): any;
    getTempFileURL(params: {
        fileList: string[];
    }, callback?: Function): any;
    downloadFile(params: {
        fileID: string;
    }, callback?: Function): any;
    uploadFile(params: {
        cloudPath: string;
        filePath: string;
        onUploadProgress?: Function;
    }, callback?: Function): any;
}
declare let tcb: TCB;
export = tcb;
