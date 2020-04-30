import * as logger from "../logger";
import {v4} from "uuid";
import * as matchDb from "./match";
import {db} from "../nodebb"

function getRedisMatchesKey(tid: number, matchId: string): string {
    return `tid:${tid}:arma3-slotting:match:${matchId}:shares`;
}

export async function delFromDb(tid: number, matchid: string, reservation: string): Promise<any> {
    return db.deleteObjectField(getRedisMatchesKey(tid, matchid), reservation);
}

export async function getAllFromDb(tid: number, matchid: string): Promise<DBShare[]> {
    const result = await db.getObject(getRedisMatchesKey(tid, matchid))
    const shares = [];
    Object.keys(result || {}).forEach(function (key) {
        if (result[key]) {
            shares.push(JSON.parse(result[key]));
        }
    });

    return shares;
}

export async function getFromDb(tid: number, matchid: string, shareid: string): Promise<DBShare> {
    const shares = await getAllFromDb(tid, matchid)
    const share = shares.find(s => s.publicUuid === shareid || s.adminUuid === shareid)
    if (share) {
        if (shareid != share.adminUuid) {
            delete share.adminUuid;
        }
    }
    return share
}

export async function insertIntoDb(tid: number, matchid: string, reservation: string): Promise<DBShare> {
    const reservations = await matchDb.getUniqueMatchReservations(tid, matchid)
    if (reservations.indexOf(reservation) > -1) {
        const dbData = new DBShare(v4(), v4(), reservation);
        await db.setObjectField(getRedisMatchesKey(tid, matchid), reservation, JSON.stringify(dbData))
        return dbData
    } else {
        // TODO test this
        throw new Error(`No reservation for ${reservation} found in match ${matchid} of tid ${tid}`)
    }
}

export async function isValidShare(tid: number, matchid: string, shareid: string): Promise<string> {
    const dbResult = await getFromDb(tid, matchid, shareid)
    if (dbResult) {
        if (shareid === dbResult.adminUuid) {
            logger.info('share ' + shareid + ' is valid as admin');
            return "admin";
        } else if (shareid === dbResult.publicUuid) {
            logger.info('share ' + shareid + ' is valid as user');
            return "user";
        } else {
            logger.info('share ' + shareid + ' is not valid');
            return "none";
        }
    } else {
        logger.info('share ' + shareid + ' is faulty');
        return "none";
    }
}

export async function getTopic(tid: number): Promise<any> {
    const result: any = await db.getObject('topic:' + tid)
    result.mainPost = await db.getObject('post:' + result.mainPid);

    return result;
}

export class DBShare {
    constructor(
        public adminUuid: string,
        public publicUuid: string,
        public reservation: string) {}
}
