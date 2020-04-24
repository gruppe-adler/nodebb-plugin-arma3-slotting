import * as logger from "../logger";
import {IDb} from "../../types/nodebb";

const db = require("../../../../src/database") as IDb;

function getUsersKey(tid: number, matchid: string): string {
    return "tid:%d:arma3-slotting:match:%s:users".replace("%d", String(tid)).replace("%s", matchid);
}

export async function putSlotUser(tid: number, matchid: string, slotid: string, uid: number): Promise<any> {
    await deleteMatchUser(tid, matchid, uid)
    return await db.setObjectField(getUsersKey(tid, matchid), slotid, String(uid))
}

export async function putSlotExternUser(tid: number, matchid: string, slotid: string, name: string): Promise<any> {
    await deleteSlotUser(tid, matchid, slotid);

    return await db.setObjectField(getUsersKey(tid, matchid), slotid, name);
}

export type Slot2User = {[slot: string]: number};

export async function getMatchUsers(
    tid: number,
    matchid
): Promise<Slot2User> {
    let slot2user: {[slot: string]: string} = await db.getObject(getUsersKey(tid, matchid))
    slot2user = slot2user || {}
    const slot2userNumeric: {[slot: string]: number} = {}
    Object.keys(slot2user).forEach(slot => slot2userNumeric[slot] = tryParseInt(slot2user[slot], slot2user[slot]))

    return slot2userNumeric
}

export async function getSlotUser(tid: number, matchid: string, slotid: string): Promise<any> {
    const uid = await db.getObjectField(getUsersKey(tid, matchid), slotid);
    return tryParseInt(uid, uid)
}

export async function deleteSlotUser(tid: number, matchid: string, slotid: string): Promise<any> {
    return db.deleteObjectField(getUsersKey(tid, matchid), slotid);
}

export async function deleteMatchUser(tid: number, matchid: string, uidToUnslot: number): Promise<number> {
    let slotIdUserMap = await getMatchUsers(tid, matchid);
    slotIdUserMap = slotIdUserMap || {};

    const slotIdClearFunctions = Object.getOwnPropertyNames(slotIdUserMap).filter(function (slotId) {
        const slottedUserId = Number(slotIdUserMap[slotId]);
        return slottedUserId === uidToUnslot;
    }).map(function (slotId) {
        return () => {
            deleteSlotUser(tid, matchid, slotId)
        };
    });

    const results = await Promise.all(slotIdClearFunctions);

    return results.length
}

function tryParseInt(str, defaultValue) {
    let retValue = defaultValue;
    if(str !== null) {
        if(str.length > 0) {
            if (!isNaN(str)) {
                retValue = parseInt(str);
            }
        }
    }
    return retValue;
}
