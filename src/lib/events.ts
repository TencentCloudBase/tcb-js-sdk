import * as EventEmitter from 'eventemitter3';

const ee = new EventEmitter();

export function addEventListener(event, listener) {
  ee.on(event, listener);
}

export function activateEvent(event: string, data?: any) {
  ee.emit(event, data);
}
