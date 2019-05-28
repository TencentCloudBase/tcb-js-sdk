"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var util_1 = require("../lib/util");
exports.callFunction = function (_a, callback) {
    var name = _a.name, data = _a.data;
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
    var action = 'functions.invokeFunction';
    var params = {
        function_name: name,
        request_data: data
    };
    var httpRequest = new request_1.Request(this.config);
    httpRequest.send(action, params).then(function (res) {
        console.log(res);
        if (res.code) {
            callback(null, res);
        }
        else {
            var result = res.data.response_data;
            try {
                result = JSON.parse(res.data.response_data);
                callback(null, {
                    result: result,
                    requestId: res.requestId
                });
            }
            catch (e) {
                callback(new Error('response data must be json'));
            }
        }
        return callback.promise;
    }).catch(function (err) {
        callback(err);
    });
    return callback.promise;
};
