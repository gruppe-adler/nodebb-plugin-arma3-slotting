import * as async from "async";
import * as _ from "underscore";
import {DbCallback, IDb} from "../../types/nodebb";

const db = require("../../../../src/database") as IDb;

function getUsersKey(tid: number, matchid: string): string {
    return "tid:%d:arma3-slotting:match:%s:users".replace("%d", String(tid)).replace("%s", matchid);
}

export function putSlotUser(tid: number, matchid: string, slotid: string, uid: number, callback: DbCallback) {
    deleteMatchUser(tid, matchid, uid, function (err) {
        if (err) {
            return callback(err);
        }
        db.setObjectField(getUsersKey(tid, matchid), slotid, String(uid), callback);
    });
}

export type Slot2User = {[slot: string]: number};

export function getMatchUsers(
    tid: number,
    matchid,
    callback: (err: Error, slot2user: Slot2User) => void,
) {
    db.getObject(getUsersKey(tid, matchid), (err, slot2user: {[slot: string]: string}) => {
        slot2user = slot2user || {};
        const slot2userNumeric: {[slot: string]: number} = {};
        Object.keys(slot2user).forEach(slot => slot2userNumeric[slot] = Number(slot2user[slot]));
        callback(err, slot2userNumeric);
    });
}

export function getSlotUser(tid: number, matchid: string, slotid: string, callback) {
    db.getObjectField(getUsersKey(tid, matchid), slotid, function (err, uid) {
        callback(err, Number(uid));
    });
}

export function deleteSlotUser(tid: number, matchid: string, slotid: string, callback) {
    db.deleteObjectField(getUsersKey(tid, matchid), slotid, callback);
}

export function deleteMatchUser(tid: number, matchid: string, uidToUnslot: number, callback) {
    getMatchUsers(tid, matchid, function (err, slotIdUserMap /*{[slotid: string]: number}*/) {
        slotIdUserMap = slotIdUserMap || {};

        if (err) {
            return callback(err);
        }

        const slotIdClearFunctions = Object.getOwnPropertyNames(slotIdUserMap).filter(function (slotId) {
            const slottedUserId = Number(slotIdUserMap[slotId]);
            return slottedUserId === uidToUnslot;
        }).map(function (slotId) {
            return _.partial(deleteSlotUser, tid, matchid, slotId);
        });

        async.parallel(
            slotIdClearFunctions,
            (error, results) => callback(error, results.length),
        );
    });
}
