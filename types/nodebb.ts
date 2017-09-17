import * as express from "express";
import {AnyCallback} from "../lib/fn";

export type DbCallback = (err?: Error, data?: any) => any;
export type BooleanResultCallback = (err?: Error, data?: boolean) => any;

export interface IDb {
    deleteObjectField: (key: string, property: string, callback: DbCallback) => any;
    getObject: (key: string, Callback) => any;
    getObjectField: (key: string, property: string, callback: DbCallback) => any;
    setObjectField: (key: string, property: string, value: string, callback: DbCallback) => any;
}

export interface INodebbRequest extends express.Request {
    uid: number;
}

export interface INodebbResponse extends express.Response {
    append: (key: string, value: string) => any;
}

export interface IPlugins {
    fireHook: (key: string, data: any, callback?: AnyCallback) => void;
}

export interface IUser {
    uid: number;
    username: string;
    picture?: string;
}

export interface IUserGroup {
    name: string;
}

export interface IUsers {
    getUsersWithFields: (userids: number[], attributes: string[], currentUser: number, callback: DbCallback) => any;
    isModerator: (uid: number, cid: number, cb: BooleanResultCallback) => any;
    isAdminOrGlobalMod: (uid: number, cb: BooleanResultCallback) => any;
}

export interface ITopics {
    exists: (tid: number, callback: BooleanResultCallback) => any;
    getFollowers: (uid: number, callback: DbCallback) => any;
    getTopicField: (tid: number, field: string, callback: DbCallback) => any;
    getTopicsByTids: (tids: number[], uid: number, callback: DbCallback) => any;
}

export interface IMeta {
    settings: {
        get: (key: string, callback: DbCallback) => any;
    };
}
