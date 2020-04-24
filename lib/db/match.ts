import {IDb} from "../../types/nodebb";
import {error} from "../logger";
import {Match} from "../match";
import * as logger from '../logger';

const db: IDb = require("../../../../src/database") as IDb;

export class MatchRepository {
    constructor(
        private db: IDb) {
    }

    public async getMatchIds(tid: number): Promise<string[]> {
        const matches = await db.getObject(getRedisMatchesKey(tid))
        return Object.keys(matches || {})
    }
}

export const matchRepository = new MatchRepository(db);

function getRedisMatchesKey(tid: number): string {
    return "tid:%d:arma3-slotting:matches".replace("%d", String(tid));
}

export function delFromDb(tid: number, matchid: string): Promise<any> {
    return db.deleteObjectField(getRedisMatchesKey(tid), matchid);
}

export async function getAllFromDb(tid: number): Promise<Match[]> {
    const result = await db.getObject(getRedisMatchesKey(tid))

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

    return matches;
}

export async function getFromDb(tid: number, matchid: string): Promise<Match|undefined> {
    const result = await db.getObjectField(getRedisMatchesKey(tid), matchid)
    if (!result) {
        return result
    }
    try {
        return new Match(JSON.parse(result).match);
    } catch (e) {
        error(`could not create a match from DB, tid ${tid}, match ${matchid}`, e);
        throw new Error(`could not create a match from DB, tid ${tid}, match ${matchid}`);
    }
}

export async function saveToDb(tid: number, matchid: string, match: Match): Promise<any> {
    return db.setObjectField(getRedisMatchesKey(tid), matchid, JSON.stringify({match: match.toJson(), tid}));
}

export async function putSlotReservation(tid: number, matchid: string, slotid: string, reservedFor: string): Promise<any> {
    const match = await getFromDb(tid, matchid)
    const s = match.getSlot(slotid);
    if (s) {
        s.setReservations([reservedFor]);
    }
    await saveToDb(tid, matchid, match)

}

export async function getMatchReservations(tid: number, matchid: string): Promise<{[slotid: string]: string}> {
    const match = await getFromDb(tid, matchid)
    const slots = match.getSlots();
    const reservations = {};
    slots.forEach(s => reservations[s.uuid] = s.getReservations().join(","));

    return reservations
}

export async function getUniqueMatchReservations(tid: number, matchid: string): Promise<any[]> {
    const match = await getFromDb(tid, matchid)
    return searchForReservations(match);
}

function searchForReservations(match, reservations = []) {
    ['company', 'platoon', 'squad', 'fireteam', 'slot'].forEach(currentFilter => {
        if (match[currentFilter] && match[currentFilter].length > 0) {
            match[currentFilter].forEach(current => {
                reservations.concat(searchForReservations(current, reservations));
                const reservation = current['reserved-for'];
                if(current['reserved-for'] && typeof reservation === typeof '' && reservations.indexOf(reservation) === -1) {
                    reservations.push(reservation);
                }
            });
        }
    });

    return reservations;
}

export async function deleteSlotReservation(tid: number, matchid: string, slotid: string): Promise<any> {
    const match = await getFromDb(tid, matchid)
    const slot = match.getSlot(slotid);
    slot.setReservations([]);
    return await saveToDb(tid, matchid, match);
}
