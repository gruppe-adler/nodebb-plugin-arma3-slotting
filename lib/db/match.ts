import {DbCallback, IDb} from "../../types/nodebb";
import {error} from "../logger";
import {Match} from "../match";

const db: IDb = require("../../../../src/database") as IDb;

type SlotReservationCallback = (err: Error, reservations: {[slotid: string]: string}) => any;

export class MatchRepository {
    constructor(
        private db: IDb) {
    }

    public getMatchIds(tid: number, callback: (error: Error, matchIds: string[]) => void): void {
        db.getObject(getRedisMatchesKey(tid), (err: Error, matches: any) => {
            callback(err, Object.keys(matches || {}));
        });
    }
}

export const matchRepository = new MatchRepository(db);

function getRedisMatchesKey(tid: number): string {
    return "tid:%d:arma3-slotting:matches".replace("%d", String(tid));
}

export function delFromDb(tid: number, matchid: string, callback) {
    db.deleteObjectField(getRedisMatchesKey(tid), matchid, callback);
}

export function getAllFromDb(tid: number, callback: (err: Error, matches: Match[]) => any) {
    db.getObject(getRedisMatchesKey(tid), function (err: Error, result) {
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

export function getFromDb(tid: number, matchid: string, callback: (err: Error, match: Match) => any) {
    db.getObjectField(getRedisMatchesKey(tid), matchid, function (err, result) {
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

export function saveToDb(tid: number, matchid: string, match: Match, callback: DbCallback) {
    db.setObjectField(getRedisMatchesKey(tid), matchid, JSON.stringify({match: match.toJson(), tid}), callback);
}

export function putSlotReservation(tid: number, matchid: string, slotid: string, reservedFor: string, cb: DbCallback) {
    getFromDb(tid, matchid, (err, match) => {
        const s = match.getSlot(slotid);
        if (s) {
            s.setReservations([reservedFor]);
        }
        saveToDb(tid, matchid, match, cb);
    });
}

export function getMatchReservations(tid: number, matchid: string, callback: SlotReservationCallback) {
    return getFromDb(tid, matchid, (err, match) => {
        const slots = match.getSlots();
        const reservations = {};
        slots.forEach(s => reservations[s.uuid] = s.getReservations().join(","));
        callback(err, reservations);
    });
}

export function getUniqueMatchReservations(tid: number, matchid: string, callback: (err: Error, result: any[]) => any) {
    return getFromDb(tid, matchid, (err, match) => {
        const slots = match.getSlots();
        const uniqueReservations = [];
        slots.forEach(s => {
            const reservation = s.getReservations().join(",");
            if (uniqueReservations.indexOf(reservation) == -1 && reservation != '') {
               uniqueReservations.push(reservation);
            }
        });
        callback(err, uniqueReservations);
    });
}

export function deleteSlotReservation(tid: number, matchid: string, slotid: string, callback: DbCallback) {
    return getFromDb(tid, matchid, (err, match) => {
        const slot = match.getSlot(slotid);
        slot.setReservations([]);
        saveToDb(tid, matchid, match, callback);
    });
}
