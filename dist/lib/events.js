"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = require("eventemitter3");
var ee = new EventEmitter();
function addEventListener(event, listener) {
    ee.on(event, listener);
}
exports.addEventListener = addEventListener;
function activateEvent(event, data) {
    ee.emit(event, data);
}
exports.activateEvent = activateEvent;
