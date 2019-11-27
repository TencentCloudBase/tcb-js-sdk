interface ICallFunctionOptions {
    name: string;
    data: Record<string, any>;
    query: Record<string, any>;
    parse: boolean;
}
interface ICallFunctionResponse {
    requestId: string;
    result: any;
}
declare type CallbackFunction = (error: Error, res?: ICallFunctionResponse) => {};
export declare const callFunction: ({ name, data, query, parse }: ICallFunctionOptions, callback?: CallbackFunction) => any;
export {};
