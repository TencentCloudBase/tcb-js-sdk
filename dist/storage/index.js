"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var util_1 = require("../lib/util");
exports.uploadFile = function (params, callback) {
    callback = callback || util_1.createPromiseCallback();
    var request = request_1.getRequestByEnvId(this.config.env);
    var metaData = 'storage.getUploadMetadata';
    var cloudPath = params.cloudPath, filePath = params.filePath, onUploadProgress = params.onUploadProgress;
    request
        .send(metaData, {
        path: cloudPath
    })
        .then(function (metaData) {
        var _a = metaData.data, url = _a.url, authorization = _a.authorization, token = _a.token, fileId = _a.fileId, cosFileId = _a.cosFileId, requestId = metaData.requestId;
        var data = {
            key: cloudPath,
            signature: authorization,
            'x-cos-meta-fileid': cosFileId,
            'success_action_status': '201',
            'x-cos-security-token': token
        };
        request.upload({
            url: url,
            data: data,
            file: filePath,
            name: cloudPath,
            onUploadProgress: onUploadProgress
        }).then(function (res) {
            if (res.statusCode === 201) {
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
exports.getUploadMetadata = function (params, callback) {
    callback = callback || util_1.createPromiseCallback();
    var request = request_1.getRequestByEnvId(this.config.env);
    var metaData = 'storage.getUploadMetadata';
    var cloudPath = params.cloudPath;
    request
        .send(metaData, {
        path: cloudPath
    })
        .then(function (metaData) {
        callback(null, metaData);
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
    var request = request_1.getRequestByEnvId(this.config.env);
    request
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
    var request = request_1.getRequestByEnvId(this.config.env);
    request
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
    return __awaiter(this, void 0, void 0, function () {
        var tmpUrlRes, res, request, tmpUrl, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, exports.getTempFileURL.call(this, {
                        fileList: [
                            {
                                fileID: fileID,
                                maxAge: 600
                            }
                        ]
                    })];
                case 1:
                    tmpUrlRes = _b.sent();
                    res = tmpUrlRes.fileList[0];
                    if (res.code !== 'SUCCESS') {
                        return [2, callback ? callback(res) : new Promise(function (resolve) { resolve(res); })];
                    }
                    request = request_1.getRequestByEnvId(this.config.env);
                    tmpUrl = res.download_url;
                    tmpUrl = encodeURI(tmpUrl);
                    if (!callback) return [3, 3];
                    return [4, request.download({ url: tmpUrl })];
                case 2:
                    result = _b.sent();
                    callback(result);
                    return [3, 4];
                case 3: return [2, request.download({ url: tmpUrl })];
                case 4: return [2];
            }
        });
    });
};
