import {DbCallback, IDb} from "../../types/nodebb";
import {error} from "../logger";
import {Match} from "../match";
import * as logger from "../logger";
import {v4} from "node-uuid";
import * as matchDb from "./match";

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

        const shares = [];
        Object.keys(result || {}).forEach(function (key) {
            if (result[key]) {
                shares.push({uuid: key, reservation: result[key]});
            }
        });
        callback(err, shares);
    });
}

export function getFromDb(tid: number, matchid: string, shareId: string, callback: (err: Error, result: string) => any) {
    db.getObjectField(getRedisMatchesKey(tid, matchid), shareId, function (err, result) {
       callback(err, result);
    });
}

export function insertIntoDb(tid: number, matchid: string, reservation: string, callback: (err: Error, result: string) => any) {
    matchDb.getMatchReservations(tid, matchid, (error, reservations) => {
        let reservationFound = false;

        Object.keys(reservations).forEach(key => {
            if (reservations[key] === reservation) {
                reservationFound = true;
            }
        });

        if (reservationFound) {
            const key = v4();
            db.setObjectField(getRedisMatchesKey(tid, matchid), key, reservation, function (err, result) {
                callback(err, key);
            });
        } else {
            logger.info(`No reservation for ${reservation} found in match ${matchid} of tid ${tid}`);
            callback(error, null);
        }
    });
}
