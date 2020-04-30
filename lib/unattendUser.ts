import * as matchDb from "./db/match";
import * as slotDb from "./db/slot";

export async function unattendUser(tid: number, uid: number): Promise<number> {
    const matches = await matchDb.getAllFromDb(tid)
    const results: number[] = await Promise.all(matches.map(function (match) {
            return slotDb.deleteMatchUser(tid, match.uuid, uid)
    }))

    return results.reduce(
        (prev: number, unslottedCount: number) => prev + unslottedCount,
        0,
    );
}
