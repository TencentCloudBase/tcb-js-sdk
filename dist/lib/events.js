"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var eventemitter3_1 = __importDefault(require("eventemitter3"));
var ee = new eventemitter3_1.default();
function addEventListener(event, listener) {
    ee.on(event, listener);
}
exports.addEventListener = addEventListener;
function activateEvent(event, data) {
    ee.emit(event, data);
}
exports.activateEvent = activateEvent;
