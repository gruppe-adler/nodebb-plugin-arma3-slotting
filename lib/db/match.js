"use strict";

const db = require('../../../../src/database');
const async = require('async');

function getRedisMatchesKey(tid) {
    return 'tid:%d:arma3-slotting:matches'.replace('%d', tid);
}

function delFromDb(tid, matchid, callback) {
    db.deleteObjectField(getRedisMatchesKey(tid), matchid, callback);
}

function getAllFromDb(tid, callback) {
    db.getObject(getRedisMatchesKey(tid), function (err, result) {
        if (err) {
            return callback(err, null);
        }

        let matches = [];
        Object.keys(result || {}).forEach(function (key) {
            if (result[key]) {
                let match = JSON.parse(result[key]);
                matches.push(match.match || match);
            }
        });
        callback(err, matches);
    })
}

function getFromDb(tid, matchid, callback) {
    db.getObjectField(getRedisMatchesKey(tid), matchid, function (err, result) {
        callback(err, JSON.parse(result || "null"));
    });
}

function saveToDb(tid, matchid, matchJson, callback) {
    db.setObjectField(getRedisMatchesKey(tid), matchid, JSON.stringify(matchJson), callback);
}

module.exports.getFromDb = getFromDb;
module.exports.getAllFromDb = getAllFromDb;
module.exports.saveToDb = saveToDb;
module.exports.delFromDb = delFromDb;
