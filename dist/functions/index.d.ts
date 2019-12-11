interface ICallFunctionOptions {
    name: string;
    data: Record<string, any>;
    query: Record<string, any>;
    search: string;
    parse: boolean;
}
interface ICallFunctionResponse {
    requestId: string;
    result: any;
}
declare type CallbackFunction = (error: Error, res?: ICallFunctionResponse) => {};
export declare const callFunction: ({ name, data, query, parse, search }: ICallFunctionOptions, callback?: CallbackFunction) => any;
export {};
