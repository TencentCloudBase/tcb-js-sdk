export declare class IEvent {
    readonly name: string;
    target: any;
    data: any;
    constructor(name: string, data: any);
}
export declare class IErrorEvent extends IEvent {
    readonly error: Error;
    constructor(error: Error, data?: any);
}
export declare function addEventListener(event: string, callback: Function): void;
export declare function activateEvent(event: string, data?: any): void;
