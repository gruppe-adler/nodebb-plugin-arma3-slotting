import * as async from "async";
import * as _ from "underscore";
import * as matchDb from "./db/match";
import * as slotDb from "./db/slot";

export function unattendUser(tid: number, uid: number, callback) {
    matchDb.getAllFromDb(tid, function (err, matches) {
        async.parallel(
            matches.map(function (match) {
                return _.partial(slotDb.deleteMatchUser, tid, match.uuid, uid);
            }),
            function (err2: Error, results: number[]) {
                callback(
                    err2,
                    results.reduce(
                        (prev: number, unslottedCount: number) => prev + unslottedCount,
                        0,
                    ),
                );
            },
        );
    });
}
