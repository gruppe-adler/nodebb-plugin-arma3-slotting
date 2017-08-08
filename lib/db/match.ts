"use strict";

import {Db, DbCallback} from '../../types/db'
const db: Db = <Db>require('../../../../src/database');
// import * as async from 'async';

export interface Match {
    tid: number;
}

export interface MatchWrapper {
    tid: number;
    match: Match;
}

function getRedisMatchesKey(tid: number): string {
    return 'tid:%d:arma3-slotting:matches'.replace('%d', String(tid));
}

export function delFromDb(tid, matchid: string, callback) {
    db.deleteObjectField(getRedisMatchesKey(tid), matchid, callback);
}

export function getAllFromDb(tid: number, callback: (err: Error, matches: Match[]) => any) {
    db.getObject(getRedisMatchesKey(tid), function (err: Error, result) {
        if (err) {
            return callback(err, null);
        }

        let matches: Match[] = [];
        Object.keys(result || {}).forEach(function (key) {
            if (result[key]) {
                let match: MatchWrapper = <MatchWrapper>JSON.parse(result[key]);
                matches.push(match.match || match);
            }
        });
        callback(err, matches);
    })
}

export function getFromDb(tid, matchid, callback: (err: Error, match: MatchWrapper) => any) {
    db.getObjectField(getRedisMatchesKey(tid), matchid, function (err, result) {
        const match: MatchWrapper = <MatchWrapper>JSON.parse(result || "null");
        if (match) {
            match.tid = tid;
        }
        if (match.match) {
            match.match.tid = tid;
        }
        callback(err, match);
    });
}

export function saveToDb(tid: number, matchid: string, matchJson: any, callback: DbCallback) {
    db.setObjectField(getRedisMatchesKey(tid), matchid, JSON.stringify(matchJson), callback);
}