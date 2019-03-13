"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../lib/request");
const util_1 = require("../lib/util");
const axios_1 = require("axios");
exports.uploadFile = function ({ cloudPath, fileContent }, { onResponseReceived }, callback) {
    callback = callback || util_1.createPromiseCallback();
    const action = 'storage.uploadFile';
    const params = {
        path: cloudPath,
        file: fileContent
    };
    callback = (response) => {
        onResponseReceived && typeof onResponseReceived === 'function' && onResponseReceived(response);
    };
    let httpRequest = new request_1.Request(this.config);
    return httpRequest.send(action, params).then((res) => {
        if (res.code) {
            return res;
        }
        else {
            return {
                fileID: res.data.fileID,
                requestId: res.requestId
            };
        }
    });
};
exports.deleteFile = function ({ fileList }) {
    if (!fileList || !Array.isArray(fileList)) {
        return {
            code: 'INVALID_PARAM',
            message: 'fileList必须是非空的数组'
        };
    }
    for (let file of fileList) {
        if (!file || typeof file !== 'string') {
            return {
                code: 'INVALID_PARAM',
                message: 'fileList的元素必须是非空的字符串'
            };
        }
    }
    const action = 'storage.batchDeleteFile';
    const params = {
        fileid_list: fileList
    };
    let httpRequest = new request_1.Request(this.config);
    return httpRequest.send(action, params).then(res => {
        if (res.code) {
            return res;
        }
        else {
            return {
                fileList: res.data.delete_list,
                requestId: res.requestId
            };
        }
    });
};
exports.getTempFileURL = function ({ fileList }) {
    if (!fileList || !Array.isArray(fileList)) {
        return {
            code: 'INVALID_PARAM',
            message: 'fileList必须是非空的数组'
        };
    }
    let file_list = [];
    for (let file of fileList) {
        if (typeof file === 'object') {
            if (!file.hasOwnProperty('fileID') ||
                !file.hasOwnProperty('maxAge')) {
                return {
                    code: 'INVALID_PARAM',
                    message: 'fileList的元素必须是包含fileID和maxAge的对象'
                };
            }
            file_list.push({
                fileid: file.fileID,
                max_age: file.maxAge
            });
        }
        else if (typeof file === 'string') {
            file_list.push({
                fileid: file,
            });
        }
        else {
            return {
                code: 'INVALID_PARAM',
                message: 'fileList的元素必须是字符串'
            };
        }
    }
    const action = 'storage.batchGetDownloadUrl';
    const params = {
        file_list
    };
    return this.httpRequest.send(action, params).then(res => {
        if (res.code) {
            return res;
        }
        else {
            return {
                fileList: res.data.download_list,
                requestId: res.requestId
            };
        }
    });
};
exports.downloadFile = function ({ fileID }) {
    let promise;
    try {
        promise = exports.getTempFileURL({
            fileList: [
                {
                    fileID,
                    maxAge: 600
                }
            ]
        });
    }
    catch (e) {
        throw e;
    }
    return promise.then((tmpUrlRes) => {
        const res = tmpUrlRes.fileList[0];
        if (res.code !== 'SUCCESS') {
            return res;
        }
        let tmpUrl = res.tempFileURL;
        tmpUrl = encodeURI(tmpUrl);
        return axios_1.default({
            url: tmpUrl,
            method: 'POST',
            responseType: 'stream'
        }).then(function (_reposne) {
        });
    });
};
