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

export function getFromDb(tid: number, matchid: string, shareid: string, callback: (err: Error, result: DBShare) => any) {
    getAllFromDb(tid, matchid, (error, shares) => {
        const share = shares.find(s => s.publicUuid === shareid || s.adminUuid === shareid);
        if (share) {
            if (shareid != share.adminUuid) {
                delete share.adminUuid;
            }
        }
        logger.info(JSON.stringify(share));
        callback(error, share);
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

export function isValidShare(tid: number, matchid: string, shareid: string, callback: (err: Error, result: string) => any) {
    getFromDb(tid, matchid, shareid, (err, dbResult) => {
        if (dbResult) {
            if (shareid === dbResult.adminUuid) {
                callback(err, "admin");
            } else if (shareid === dbResult.publicUuid) {
                callback(err, "user");
            } else {
                callback(err, "none");
            }
        } else {
            callback(err, "none");
        }
    });
}

export function getTopic(tid: number, callback: (err: Error, result: string) => any) {
    db.getObject('topic:' + tid, (error, result) => {
        db.getObject('post:' + result.mainPid, (error, initialPost) => {
            result.mainPost = initialPost;
            logger.info(JSON.stringify(result));
            callback(error, result);
        });
    });
}

export class DBShare {
    constructor(
        public adminUuid: string,
        public publicUuid: string,
        public reservation: string) {}
}
