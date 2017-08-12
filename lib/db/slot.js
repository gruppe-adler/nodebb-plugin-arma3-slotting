"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db = require("../../../../src/database");
var async = require("async");
var _ = require("underscore");
function getUsersKey(tid, matchid) {
    return 'tid:%d:arma3-slotting:match:%s:users'.replace('%d', String(tid)).replace('%s', matchid);
}
function getReservationsKey(tid, matchid) {
    return 'tid:%d:arma3-slotting:match:%s:reservations'.replace('%d', String(tid)).replace('%s', matchid);
}
function putSlotUser(tid, matchid, slotid, uid, callback) {
    deleteMatchUser(tid, matchid, uid, function (err) {
        if (err) {
            return callback(err);
        }
        db.setObjectField(getUsersKey(tid, matchid), slotid, uid, callback);
    });
}
exports.putSlotUser = putSlotUser;
function getMatchUsers(tid, matchid, callback) {
    db.getObject(getUsersKey(tid, matchid), callback);
}
exports.getMatchUsers = getMatchUsers;
function getSlotUser(tid, matchid, slotid, callback) {
    db.getObjectField(getUsersKey(tid, matchid), slotid, function (err, uid) {
        callback(err, Number(uid));
    });
}
exports.getSlotUser = getSlotUser;
function deleteSlotUser(tid, matchid, slotid, callback) {
    db.deleteObjectField(getUsersKey(tid, matchid), slotid, callback);
}
exports.deleteSlotUser = deleteSlotUser;
function deleteMatchUser(tid, matchid, uidToUnslot, callback) {
    getMatchUsers(tid, matchid, function (err, slotIdUserMap /*{[slotid: string]: number}*/) {
        slotIdUserMap = slotIdUserMap || {};
        if (err) {
            return callback(err);
        }
        var slotIdClearFunctions = Object.getOwnPropertyNames(slotIdUserMap).filter(function (slotId) {
            var slottedUserId = Number(slotIdUserMap[slotId]);
            return slottedUserId === uidToUnslot;
        }).map(function (slotId) {
            return _.partial(deleteSlotUser, tid, matchid, slotId);
        });
        async.parallel(slotIdClearFunctions, function (err, results) {
            callback(err, results.length);
        });
    });
}
exports.deleteMatchUser = deleteMatchUser;
function putSlotReservation(tid, matchid, slotid, reservedFor, callback) {
    db.setObjectField(getReservationsKey(tid, matchid), slotid, reservedFor, callback);
}
exports.putSlotReservation = putSlotReservation;
function getMatchReservations(tid, matchid, callback) {
    return db.getObject(getReservationsKey(tid, matchid), callback);
}
exports.getMatchReservations = getMatchReservations;
function deleteSlotReservation(tid, matchid, slotid, callback) {
    db.deleteObjectField(getReservationsKey(tid, matchid), slotid, callback);
}
exports.deleteSlotReservation = deleteSlotReservation;
