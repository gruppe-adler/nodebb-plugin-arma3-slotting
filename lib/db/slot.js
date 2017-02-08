"use strict";

const db = require('../../../../src/database');
const async = require('async');
const _ = require('underscore');

function getUsersKey(tid, matchid) {
    return 'tid:%d:arma3-slotting:match:%s:users'.replace('%d', tid).replace('%s', matchid);
}

function getReservationsKey(tid, matchid) {
    return 'tid:%d:arma3-slotting:match:%s:reservations'.replace('%d', tid).replace('%s', matchid);
}

function putSlotUser(tid, matchid, slotid, uid, callback) {
    deleteMatchUser(tid, matchid, uid, function (err) {
        if (err) {
            return callback(err);
        }
        db.setObjectField(getUsersKey(tid, matchid), slotid, uid, callback);
    });
}

function getMatchUsers(tid, matchid, callback) {
    db.getObject(getUsersKey(tid, matchid), callback);
}

function deleteSlotUser(tid, matchid, slotid, callback) {
    db.deleteObjectField(getUsersKey(tid, matchid), slotid, callback);
}

function deleteMatchUser(tid, matchid, uidToUnslot, callback) {
    getMatchUsers(tid, matchid, function (err, slotIdUserMap /*{[slotid: string]: number}*/) {
        slotIdUserMap = slotIdUserMap || {};

        if (err) {
            return callback(err);
        }

        let slotIdClearFunctions = Object.getOwnPropertyNames(slotIdUserMap).filter(function (slotId) {
            let slottedUserId = Number(slotIdUserMap[slotId]);
            return slottedUserId === uidToUnslot;
        }).map(function (slotId) {
            return _.partial(deleteSlotUser, tid, matchid, slotId);
        });

        async.parallel(
            slotIdClearFunctions,
            callback
        );
    });
}

function putSlotReservation(tid, matchid, slotid, reservedFor, callback) {
    db.setObjectField(getReservationsKey(tid, matchid), slotid, reservedFor, callback)
}

function getMatchReservations(tid, matchid, callback) {
    return db.getObject(getReservationsKey(tid, matchid), callback);
}

function deleteSlotReservation(tid, matchid, slotid, callback) {
    db.deleteObjectField(getReservationsKey(tid, matchid), slotid, callback);
}

module.exports.putSlotReservation = putSlotReservation;
module.exports.putSlotUser = putSlotUser;
module.exports.getMatchUsers = getMatchUsers;
module.exports.getMatchReservations = getMatchReservations;
module.exports.getReservationsKey = getReservationsKey;
module.exports.getUsersKey = getUsersKey;
module.exports.deleteMatchUser = deleteMatchUser;
module.exports.deleteSlotReservation = deleteSlotReservation;
module.exports.deleteSlotUser = deleteSlotUser;
