"use strict";

import * as db from '../../../../src/database';
import * as async from 'async';
import * as _ from 'underscore';
import {DbCallback} from '../../types/nodebb'

function getUsersKey(tid: number, matchid: string): string {
    return 'tid:%d:arma3-slotting:match:%s:users'.replace('%d', String(tid)).replace('%s', matchid);
}

function getReservationsKey(tid: number, matchid: string): string {
    return 'tid:%d:arma3-slotting:match:%s:reservations'.replace('%d', String(tid)).replace('%s', matchid);
}

export function putSlotUser(tid: number, matchid: string, slotid: string, uid: number, callback: DbCallback) {
    deleteMatchUser(tid, matchid, uid, function (err) {
        if (err) {
            return callback(err);
        }
        db.setObjectField(getUsersKey(tid, matchid), slotid, uid, callback);
    });
}

export function getMatchUsers(tid: number, matchid, callback) {
    db.getObject(getUsersKey(tid, matchid), callback);
}

export function getSlotUser(tid: number, matchid, slotid, callback) {
    db.getObjectField(getUsersKey(tid, matchid), slotid, function (err, uid) {
        callback(err, Number(uid));
    });
}

export function deleteSlotUser(tid: number, matchid, slotid, callback) {
    db.deleteObjectField(getUsersKey(tid, matchid), slotid, callback);
}

export function deleteMatchUser(tid: number, matchid, uidToUnslot, callback) {
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
            function (err, results) {
                callback(err, results.length);
            }
        );
    });
}

export function putSlotReservation(tid: number, matchid, slotid, reservedFor: string, callback: DbCallback) {
    db.setObjectField(getReservationsKey(tid, matchid), slotid, reservedFor, callback);
}

export function getMatchReservations(tid: number, matchid, callback) {
    return db.getObject(getReservationsKey(tid, matchid), callback);
}

export function deleteSlotReservation(tid: number, matchid, slotid, callback: DbCallback) {
    db.deleteObjectField(getReservationsKey(tid, matchid), slotid, callback);
}
