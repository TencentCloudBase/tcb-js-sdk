import { Db } from '@cloudbase/database';
import Auth from './auth';
import { RequestMode } from './types';
declare type InitConfig = {
    env: string;
    timeout?: number;
    mode?: RequestMode;
};
declare class TCB {
    config: any;
    authObj: Auth;
    constructor(config?: InitConfig);
    init(config: InitConfig): TCB;
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
        filePath: File;
        onUploadProgress?: Function;
    }, callback?: Function): any;
}
declare let tcb: TCB;
export = tcb;
