"use strict";

let matchDb = require('./db/match');
let slotDb = require('./db/slot');
let async = require('async');
let _ = require('underscore');

module.exports.unattendUser = function (tid, uid, callback) {
    matchDb.getAllFromDb(tid, function (err, matches) {
        async.parallel(
            matches.map(function (match) {
                return _.partial(slotDb.deleteMatchUser, tid, match.uuid, uid);
            }),
            function (err, results) {
                callback(err, results.reduce(function (prev, unslottedCount) { return prev + unslottedCount }, 0));
            }
        );
    });
};
