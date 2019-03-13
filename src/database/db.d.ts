import { Point } from "./geo/point";
import { CollectionReference } from "./collection";
import { Command } from "./command";
import { Config } from '../types';
interface GeoTeyp {
    Point: typeof Point;
}
export declare class Db {
    Geo: GeoTeyp;
    command: typeof Command;
    RegExp: any;
    serverDate: any;
    config: Config;
    constructor(config?: any);
    collection(collName: string): CollectionReference;
    createCollection(collName: string): Promise<any>;
}
export {};
