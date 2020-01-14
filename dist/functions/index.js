"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = require("../lib/request");
var util_1 = require("../lib/util");
exports.callFunction = function (_a, callback) {
    var name = _a.name, data = _a.data, query = _a.query, parse = _a.parse, search = _a.search;
    var promisedCallback = callback || util_1.createPromiseCallback();
    var jsonData;
    try {
        jsonData = data ? JSON.stringify(data) : '';
    }
    catch (e) {
        return Promise.reject(e);
    }
    if (!name) {
        return Promise.reject(new Error('函数名不能为空'));
    }
    var action = 'functions.invokeFunction';
    var params = {
        query: query,
        parse: parse,
        search: search,
        function_name: name,
        request_data: jsonData
    };
    request_1.request
        .send(action, params)
        .then(function (res) {
        if (res.code) {
            promisedCallback(null, res);
        }
        else {
            var result = res.data.response_data;
            if (parse) {
                promisedCallback(null, {
                    result: result,
                    requestId: res.requestId
                });
            }
            else {
                try {
                    result = JSON.parse(res.data.response_data);
                    promisedCallback(null, {
                        result: result,
                        requestId: res.requestId
                    });
                }
                catch (e) {
                    promisedCallback(new Error('response data must be json'));
                }
            }
        }
        return promisedCallback.promise;
    })
        .catch(function (err) {
        promisedCallback(err);
    });
    return promisedCallback.promise;
};
