"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db = require('../../../../src/database');
function getRedisMatchesKey(tid) {
    return 'tid:%d:arma3-slotting:matches'.replace('%d', String(tid));
}
function delFromDb(tid, matchid, callback) {
    db.deleteObjectField(getRedisMatchesKey(tid), matchid, callback);
}
exports.delFromDb = delFromDb;
function getAllFromDb(tid, callback) {
    db.getObject(getRedisMatchesKey(tid), function (err, result) {
        if (err) {
            return callback(err, null);
        }
        var matches = [];
        Object.keys(result || {}).forEach(function (key) {
            if (result[key]) {
                var match = JSON.parse(result[key]);
                matches.push((match.match || match));
            }
        });
        callback(err, matches);
    });
}
exports.getAllFromDb = getAllFromDb;
function getFromDb(tid, matchid, callback) {
    db.getObjectField(getRedisMatchesKey(tid), matchid, function (err, result) {
        var match = JSON.parse(result || "null");
        if (match) {
            match.tid = tid;
        }
        if (match.match) {
            match.match.tid = tid;
        }
        callback(err, match);
    });
}
exports.getFromDb = getFromDb;
function saveToDb(tid, matchid, matchJson, callback) {
    db.setObjectField(getRedisMatchesKey(tid), matchid, JSON.stringify(matchJson), callback);
}
exports.saveToDb = saveToDb;
