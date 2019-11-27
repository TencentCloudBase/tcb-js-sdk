import { Db } from '@cloudbase/database';
import Auth from './auth';
import { RequestMode } from './types';
declare global {
    interface Window {
        tcb: TCB;
    }
}
interface ICloudbaseConfig {
    env: string;
    timeout?: number;
    mode?: RequestMode;
    persistence?: string;
}
declare type Persistence = 'local' | 'session' | 'none';
declare class TCB {
    config: ICloudbaseConfig;
    authObj: Auth;
    constructor(config?: ICloudbaseConfig);
    init(config: ICloudbaseConfig): TCB;
    database(dbConfig?: object): Db;
    auth({ persistence }?: {
        persistence?: Persistence;
    }): Auth;
    on(eventName: string, callback: Function): void;
    callFunction(params: {
        name: string;
        data: any;
        query: any;
        parse: boolean;
    }, callback?: Function): any;
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
declare const tcb: TCB;
export = tcb;
