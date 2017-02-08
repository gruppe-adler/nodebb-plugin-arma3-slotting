"use strict";

const db = require('../../../../src/database');
const async = require('async');

function getUsersKey(tid, matchid) {
    return 'tid:%d:arma3-slotting:match:%s:users'.replace('%d', tid).replace('%s', matchid);
}

function getReservationsKey(tid, matchid) {
    return 'tid:%d:arma3-slotting:match:%s:reservations'.replace('%d', tid).replace('%s', matchid);
}

module.exports.putSlotUser = function (tid, matchid, slotid, uid, callback) {
    db.setObjectField(getUsersKey(tid, matchid), slotid, uid, callback)
};

module.exports.getMatchUsers = function (tid, matchid, callback) {
    db.getObject(getUsersKey(tid, matchid), callback);
};

module.exports.deleteSlotUser = function (tid, matchid, slotid, callback) {
    db.deleteObjectField(getUsersKey(tid, matchid), slotid, callback);
};

module.exports.deleteMatchUser = function (tid, matchid, uidToUnslot, callback) {
    module.exports.getMatchUsers(tid, matchid, function (err, slotIdUserMap /*{[slotid: string]: number}*/) {
        slotIdUserMap = slotIdUserMap || {};

        if (err) {
            return callback(err);
        }

        let slotIdClearFunctions = Object.getOwnPropertyNames(slotIdUserMap).
            filter(function (slotId) {
                let slottedUserId = Number(slotIdUserMap[slotId]);
                return slottedUserId === uidToUnslot;
            }).
            map(function (slotId) {
                _.partial(module.exports.deleteSlotUser, tid, matchid, slotId);
            });

        async.parallel(
            slotIdClearFunctions,
            callback
        );
    });
};

module.exports.putSlotReservation = function (tid, matchid, slotid, reservedFor, callback) {
    db.setObjectField(getReservationsKey(tid, matchid), slotid, reservedFor, callback)
};

module.exports.getMatchReservations = function getMatchReservations(tid, matchid, callback) {
    return db.getObject(getReservationsKey(tid, matchid), callback);
};

module.exports.deleteSlotReservation = function (tid, matchid, slotid, callback) {
    db.deleteObjectField(getReservationsKey(tid, matchid), slotid, callback);
};
