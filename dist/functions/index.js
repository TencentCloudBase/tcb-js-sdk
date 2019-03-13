"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../lib/request");
const util_1 = require("../lib/util");
exports.callFunction = function ({ name, data }, callback) {
    callback = callback || util_1.createPromiseCallback();
    try {
        data = data ? JSON.stringify(data) : '';
    }
    catch (e) {
        return Promise.reject(e);
    }
    if (!name) {
        return Promise.reject(new Error('函数名不能为空'));
    }
    const action = 'functions.invokeFunction';
    let params = {
        function_name: name,
        request_data: data
    };
    let httpRequest = new request_1.Request(this.config);
    httpRequest.send(action, params).then(res => {
        console.log(res);
        if (res.code) {
            callback(0, res);
        }
        else {
            let result = res.data.response_data;
            try {
                result = JSON.parse(res.data.response_data);
                callback(0, {
                    result,
                    requestId: res.requestId
                });
            }
            catch (e) {
                callback(new Error('response data must be json'));
            }
        }
    });
    return callback.promise;
};
