import * as express from "express";
import {AnyCallback} from "../lib/fn";

export type DbCallback = (err?: Error, data?: any) => any;
export type BooleanResultCallback = (err?: Error, data?: boolean) => any;

export interface IDb {
    deleteObjectField: (key: string, property: string) => Promise<any>;
    getObject: (key: string) => Promise<{ [key:string]: string }>;
    getObjectField: (key: string, property: string, callback?: DbCallback) => Promise<string|null>;
    setObjectField: (key: string, property: string, value: string|number, callback?: DbCallback) => Promise<string>;
}

export interface INodebbRequest extends express.Request {
    uid: number;
}

export interface INodebbResponse extends express.Response {
    append: (key: string, value: string) => any;
}

export interface IPlugins {
    hooks: {
        fire: (key: string, data: any, callback?: AnyCallback) => void
    }
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
    getUsersWithFields: (userids: number[], attributes: string[], currentUser: number) => Promise<any>;
    isModerator: (uid: number, cid: number) => Promise<boolean>;
    isAdminOrGlobalMod: (uid: number) => Promise<boolean>;
}

export interface IUserGroups {
    getUserGroups(uids: number[]): Promise<any>
}

export interface ITopics {
    exists: (tid: number) => Promise<boolean>;
    getFollowers: (uid: number) => Promise<any>;
    getTopicField: (tid: number, field: string) => Promise<any>;
    getTopicsByTids: (tids: number[], uid: number) => Promise<any>;
}

export interface IMeta {
    settings: {
        get: (key: string) => Promise<any>;
    };
    config: any //???
}
