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

export function delFromDb(tid: number, matchid: string, reservation: string, callback) {
    db.deleteObjectField(getRedisMatchesKey(tid, matchid), reservation, callback);
}

export function getAllFromDb(tid: number, matchid: string, callback: (err: Error, shares: DBShare[]) => any) {
    db.getObject(getRedisMatchesKey(tid, matchid), function (err: Error, result) {
        if (err) {
            return callback(err, null);
        }

        const shares = [];
        Object.keys(result || {}).forEach(function (key) {
            if (result[key]) {
                shares.push(JSON.parse(result[key]));
            }
        });
        callback(err, shares);
    });
}

export function getFromDb(tid: number, matchid: string, reservation: string, callback: (err: Error, result: DBShare) => any) {
    db.getObjectField(getRedisMatchesKey(tid, matchid), reservation, function (err, result) {
        const parsedResult = JSON.parse(result);
        parsedResult.reservation = reservation;
        callback(err, parsedResult);
    });
}

export function insertIntoDb(tid: number, matchid: string, reservation: string, callback: (err: Error, result: DBShare) => any) {
    matchDb.getUniqueMatchReservations(tid, matchid, (error, reservations) => {
        if (reservations.indexOf(reservation) > -1) {
            const dbData = new DBShare(v4(), v4(), reservation);
            db.setObjectField(getRedisMatchesKey(tid, matchid), reservation, JSON.stringify(dbData), function (err, result) {
                callback(err, dbData);
            });
        } else {
            logger.info(`No reservation for ${reservation} found in match ${matchid} of tid ${tid}`);
            callback(error, null);
        }
    });
}

export class DBShare {
    constructor(
        public adminUuid: string,
        public publicUuid: string,
        public reservation: string) {}
}
