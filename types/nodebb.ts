import {Request, Response} from 'express';

export type DbCallback = (err?: Error, data?: any) => any;
export type BooleanResultCallback = (err?: Error, data?: boolean) => any;

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

export interface plugins {
    fireHook: (key: string, data: any, callback?: Function) => void;
}

export interface User {
    uid: number;
    username: string;
    picture: string;
    // ...
}

export interface Users {
    getUsersWithFields: (userids: number[], attributes: string[], currentUser: number, callback: DbCallback) => any;
    isModerator: (uid: number, cid: number, cb: BooleanResultCallback) => any;
    isAdminOrGlobalMod: (uid: number, cb: BooleanResultCallback) => any;
}

export interface Topics {
    exists: (tid: number, callback: BooleanResultCallback) => any;
    getFollowers: (uid: number, callback: DbCallback) => any;
    getTopicField: (tid: number, field: string, callback: DbCallback) => any;
    getTopicsByTids: (tids: number[], uid: number, callback: DbCallback) => any;
}

export interface Meta {
    settings: {
        get: (key: string, callback: DbCallback) => any;
    }
}
