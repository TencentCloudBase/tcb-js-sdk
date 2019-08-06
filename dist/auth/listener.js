"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ListenerMap = {};
function addEventListener(event, listener) {
    if (ListenerMap[event]) {
        ListenerMap[event].push(listener);
    }
    else {
        ListenerMap[event] = [listener];
    }
}
exports.addEventListener = addEventListener;
function activateEvent(event, data) {
    if (ListenerMap[event]) {
        for (var _i = 0, _a = ListenerMap[event]; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener(data);
        }
    }
}
exports.activateEvent = activateEvent;
