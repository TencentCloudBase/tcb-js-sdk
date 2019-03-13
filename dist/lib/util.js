"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuery = function (name, url) {
    let u = url || window.location.search;
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    let r = u.substr(u.indexOf('\?') + 1).match(reg);
    return r != null ? r[2] : '';
};
exports.removeParam = function (key, sourceURL) {
    let rtn = sourceURL.split('?')[0];
    let param;
    let params_arr = [];
    let queryString = (sourceURL.indexOf('?') !== -1) ? sourceURL.split('?')[1] : '';
    if (queryString !== '') {
        params_arr = queryString.split('&');
        for (let i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split('=')[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + '?' + params_arr.join('&');
    }
    return rtn;
};
exports.createPromiseCallback = () => {
    let cb;
    if (!Promise) {
        cb = () => { };
        cb.promise = {};
        const throwPromiseNotDefined = () => {
            throw new Error('Your Node runtime does support ES6 Promises. ' +
                'Set "global.Promise" to your preferred implementation of promises.');
        };
        Object.defineProperty(cb.promise, 'then', { get: throwPromiseNotDefined });
        Object.defineProperty(cb.promise, 'catch', { get: throwPromiseNotDefined });
        return cb;
    }
    const promise = new Promise((resolve, reject) => {
        cb = (err, data) => {
            if (err)
                return reject(err);
            return resolve(data);
        };
    });
    cb.promise = promise;
    return cb;
};
