"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
function _addEventListener(name, listener, listeners) {
    listeners[name] = listeners[name] || [];
    listeners[name].push(listener);
}
function _removeEventListener(name, listener, listeners) {
    if (listeners && listeners[name]) {
        var index = listeners[name].indexOf(listener);
        if (index !== -1) {
            listeners[name].splice(index, 1);
        }
    }
}
var IEvent = (function () {
    function IEvent(name, data) {
        this.data = data || null;
        this.name = name;
    }
    return IEvent;
}());
exports.IEvent = IEvent;
var IErrorEvent = (function (_super) {
    __extends(IErrorEvent, _super);
    function IErrorEvent(error, data) {
        var _this = _super.call(this, 'error', { error: error, data: data }) || this;
        _this.error = error;
        return _this;
    }
    return IErrorEvent;
}(IEvent));
exports.IErrorEvent = IErrorEvent;
var IEventEmitter = (function () {
    function IEventEmitter() {
        this._listeners = {};
    }
    IEventEmitter.prototype.on = function (name, listener) {
        _addEventListener(name, listener, this._listeners);
        return this;
    };
    IEventEmitter.prototype.off = function (name, listener) {
        _removeEventListener(name, listener, this._listeners);
        return this;
    };
    IEventEmitter.prototype.fire = function (event, data) {
        if (util_1.isInstanceOf(event, IErrorEvent)) {
            console.error(event.error);
            return this;
        }
        var ev = util_1.isString(event) ? new IEvent(event, data || {}) : event;
        var name = ev.name;
        if (this._listens(name)) {
            ev.target = this;
            var handlers = this._listeners[name] ? this._listeners[name].slice() : [];
            for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
                var fn = handlers_1[_i];
                fn.call(this, ev);
            }
        }
        return this;
    };
    IEventEmitter.prototype._listens = function (name) {
        return this._listeners[name] && this._listeners[name].length > 0;
    };
    return IEventEmitter;
}());
var iEventEmitter = new IEventEmitter();
function addEventListener(event, callback) {
    iEventEmitter.on(event, callback);
}
exports.addEventListener = addEventListener;
function activateEvent(event, data) {
    if (data === void 0) { data = {}; }
    iEventEmitter.fire(event, data);
}
exports.activateEvent = activateEvent;
