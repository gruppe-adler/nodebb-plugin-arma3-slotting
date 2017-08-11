"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var matchDb = require("./db/match");
var slotDb = require("./db/slot");
var async = require("async");
var _ = require("underscore");
function unattendUser(tid, uid, callback) {
    matchDb.getAllFromDb(tid, function (err, matches) {
        async.parallel(matches.map(function (match) {
            return _.partial(slotDb.deleteMatchUser, tid, match.uuid, uid);
        }), function (err, results) {
            callback(err, results.reduce(function (prev, unslottedCount) { return prev + unslottedCount; }, 0));
        });
    });
}
exports.unattendUser = unattendUser;
