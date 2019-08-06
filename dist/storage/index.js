"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var request_1 = require("../lib/request");
var util_1 = require("../lib/util");
exports.uploadFile = function (_a, callback) {
    var cloudPath = _a.cloudPath, filePath = _a.filePath, onUploadProgress = _a.onUploadProgress;
    callback = callback || util_1.createPromiseCallback();
    var metaData = 'storage.getUploadMetadata';
    var httpRequest = new request_1.Request(this.config);
    httpRequest
        .send(metaData, {
        path: cloudPath
    })
        .then(function (metaData) {
        var _a = metaData.data, url = _a.url, authorization = _a.authorization, token = _a.token, fileId = _a.fileId, cosFileId = _a.cosFileId, requestId = metaData.requestId;
        var formData = new FormData();
        formData.append('key', cloudPath);
        formData.append('signature', authorization);
        formData.append('x-cos-meta-fileid', cosFileId);
        formData.append('success_action_status', '201');
        formData.append('x-cos-security-token', token);
        formData.append('file', filePath);
        axios_1.default
            .post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: onUploadProgress
        })
            .then(function (res) {
            if (res.status === 201) {
                callback(null, {
                    fileID: fileId,
                    requestId: requestId
                });
            }
            else {
                callback(new Error("STORAGE_REQUEST_FAIL: " + res.data));
            }
        })
            .catch(function (err) {
            callback(err);
        });
    })
        .catch(function (err) {
        callback(err);
    });
    return callback.promise;
};
exports.deleteFile = function (_a, callback) {
    var fileList = _a.fileList;
    callback = callback || util_1.createPromiseCallback();
    if (!fileList || !Array.isArray(fileList)) {
        return {
            code: 'INVALID_PARAM',
            message: 'fileList必须是非空的数组'
        };
    }
    for (var _i = 0, fileList_1 = fileList; _i < fileList_1.length; _i++) {
        var file = fileList_1[_i];
        if (!file || typeof file !== 'string') {
            return {
                code: 'INVALID_PARAM',
                message: 'fileList的元素必须是非空的字符串'
            };
        }
    }
    var action = 'storage.batchDeleteFile';
    var params = {
        fileid_list: fileList
    };
    var httpRequest = new request_1.Request(this.config);
    httpRequest
        .send(action, params)
        .then(function (res) {
        if (res.code) {
            callback(null, res);
        }
        else {
            callback(null, {
                fileList: res.data.delete_list,
                requestId: res.requestId
            });
        }
    })
        .catch(function (err) {
        callback(err);
    });
    return callback.promise;
};
exports.getTempFileURL = function (_a, callback) {
    var fileList = _a.fileList;
    callback = callback || util_1.createPromiseCallback();
    if (!fileList || !Array.isArray(fileList)) {
        callback(null, {
            code: 'INVALID_PARAM',
            message: 'fileList必须是非空的数组'
        });
    }
    var file_list = [];
    for (var _i = 0, fileList_2 = fileList; _i < fileList_2.length; _i++) {
        var file = fileList_2[_i];
        if (typeof file === 'object') {
            if (!file.hasOwnProperty('fileID') || !file.hasOwnProperty('maxAge')) {
                callback(null, {
                    code: 'INVALID_PARAM',
                    message: 'fileList的元素必须是包含fileID和maxAge的对象'
                });
            }
            file_list.push({
                fileid: file.fileID,
                max_age: file.maxAge
            });
        }
        else if (typeof file === 'string') {
            file_list.push({
                fileid: file
            });
        }
        else {
            callback(null, {
                code: 'INVALID_PARAM',
                message: 'fileList的元素必须是字符串'
            });
        }
    }
    var action = 'storage.batchGetDownloadUrl';
    var params = {
        file_list: file_list
    };
    var httpRequest = new request_1.Request(this.config);
    httpRequest
        .send(action, params)
        .then(function (res) {
        if (res.code) {
            callback(null, res);
        }
        else {
            callback(null, {
                fileList: res.data.download_list,
                requestId: res.requestId
            });
        }
    })
        .catch(function (err) {
        callback(err);
    });
    return callback.promise;
};
exports.downloadFile = function (_a, callback) {
    var fileID = _a.fileID;
    callback = callback || util_1.createPromiseCallback();
    var promise;
    promise = exports.getTempFileURL.call(this, {
        fileList: [
            {
                fileID: fileID,
                maxAge: 600
            }
        ]
    });
    promise.then(function (tmpUrlRes) {
        var res = tmpUrlRes.fileList[0];
        if (res.code !== 'SUCCESS') {
            callback(res);
            return;
        }
        var tmpUrl = res.download_url;
        tmpUrl = encodeURI(tmpUrl);
        axios_1.default
            .get(tmpUrl, {
            responseType: 'blob'
        })
            .then(function (response) {
            var url = window.URL.createObjectURL(new Blob([response.data]));
            var link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'file.pdf');
            document.body.appendChild(link);
            link.click();
        });
    });
    return callback.promise;
};
