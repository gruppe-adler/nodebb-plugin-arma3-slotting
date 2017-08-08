import {Request, Response} from 'express';

export type DbCallback = (err: Error, data: any) => any;

export interface Db {
    deleteObjectField: (key: string, property: string, callback: DbCallback) => any;
    getObject: (key: string, Callback) => any;
    getObjectField: (key: string, property: string, callback: DbCallback) => any;
    setObjectField: (key: string, property: string, value: string, callback: DbCallback) => any;
}


export interface NodebbRequest extends Request {
    uid: number;
}

export interface NodebbResponse extends Response {
    append: (key: string, value: string) => any;
}
