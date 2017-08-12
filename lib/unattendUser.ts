import * as matchDb from './db/match';
import * as slotDb from './db/slot';
import * as async from 'async';
import * as _ from 'underscore';

export function unattendUser(tid: number, uid: number, callback) {
    matchDb.getAllFromDb(tid, function (err, matches) {
        async.parallel(
            matches.map(function (match) {
                return _.partial(slotDb.deleteMatchUser, tid, match.uuid, uid);
            }),
            function (err: Error, results: number[]) {
                callback(
                    err,
                    results.reduce(
                        (prev: number, unslottedCount: number) => prev + unslottedCount,
                        0
                    )
                );
            }
        );
    });
}
