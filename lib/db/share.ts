import {DbCallback, IDb} from "../../types/nodebb";
import {error} from "../logger";
import {Match} from "../match";

const db: IDb = require("../../../../src/database") as IDb;

function getRedisMatchesKey(tid: number, matchId: string): string {
    return `tid:${tid}:arma3-slotting:match:${matchId}:shares`;
}

export function delFromDb(tid: number, matchid: string, shareId: string, callback) {
    db.deleteObjectField(getRedisMatchesKey(tid, matchid), shareId, callback);
}

export function getAllFromDb(tid: number, matchid: string, callback: (err: Error, matches: Match[]) => any) {
    db.getObject(getRedisMatchesKey(tid, matchid), function (err: Error, result) {
        if (err) {
            return callback(err, null);
        }

        const matches: Match[] = [];
        Object.keys(result || {}).forEach(function (key) {
            if (result[key]) {
                try {
                    const match: Match = new Match(JSON.parse(result[key]).match);
                    matches.push(match);
                } catch (e) {
                    error(`could not create a match from DB, tid ${tid}, match ${key}`, e);
                }
            }
        });
        callback(err, matches);
    });
}

export function getFromDb(tid: number, matchid: string, shareId: string, callback: (err: Error, match: Match) => any) {
    db.getObjectField(getRedisMatchesKey(tid, matchid), shareId, function (err, result) {
        if (!result) {
            return callback(err, result);
        }

        let match: Match;
        try {
            match = new Match(JSON.parse(result).match);
        } catch (e) {
            error(`could not create a match from DB, tid ${tid}, match ${matchid}`, e);
            return callback(e, null);
        }

        callback(err, match);
    });
}
