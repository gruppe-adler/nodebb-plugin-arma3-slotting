"use strict";

const db = require('../../../../src/database');

function getUsersKey(tid, matchid) {
    return 'tid:%d:arma3-slotting:match:%s:users'.replace('%d', tid).replace('%s', matchid);
}

function getReservationsKey(tid, matchid) {
    return 'tid:%d:arma3-slotting:match:%s:reservations'.replace('%d', tid).replace('%s', matchid);
}

module.exports.putMatchUser = function (tid, matchid, slotid, uid, callback) {
    db.setObjectField(getUsersKey(tid, matchid), slotid, uid, callback)
};

module.exports.getMatchUsers = function (tid, matchid, callback) {
    return db.getObject(getUsersKey(tid, matchid), function (err, result) {
        if (err) {
            return callback(err);
        }

        callback(null, result);
    });
};

module.exports.deleteMatchUser = function (tid, matchid, slotid, callback) {
    db.deleteObjectField(getUsersKey(tid, matchid), slotid, callback);
};

module.exports.putMatchReservation = function (tid, matchid, slotid, reservedFor, callback) {
    db.setObjectField(getReservationsKey(tid, matchid), slotid, reservedFor, callback)
};

module.exports.getMatchReservations = function getMatchReservations(tid, matchid, callback) {
    return db.getObject(getReservationsKey(tid, matchid), function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, result);
    });
};

module.exports.deleteMatchReservation = function (tid, matchid, slotid, callback) {
    db.deleteObjectField(getReservationsKey(tid, matchid), slotid, callback);
};
