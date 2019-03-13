export declare const uploadFile: ({ cloudPath, fileContent }: {
    cloudPath: any;
    fileContent: any;
}, { onResponseReceived }: {
    onResponseReceived: any;
}, callback: any) => Promise<any>;
export declare const deleteFile: ({ fileList }: {
    fileList: any;
}) => Promise<any> | {
    code: string;
    message: string;
};
export declare const getTempFileURL: ({ fileList }: {
    fileList: any;
}) => any;
export declare const downloadFile: ({ fileID }: {
    fileID: any;
}) => Promise<any>;
