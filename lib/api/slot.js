"use strict";

let slotDb = require('../db/slot');

module.exports.getAll = function (req, res, next) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;

    slotDb.getMatchUsers(tid, matchid, function (err, users) {
        if (err) {
            return res.status(500).json(err);
        }
        users = users || {};
        Object.keys(users).forEach(function (key) {
            users[key] = parseInt(users[key], 10);
        });
        slotDb.getMatchReservations(tid, matchid, function (err, reservations) {
            if (err) {
                return res.status(500).json(err);
            }
            reservations = reservations || {};

            return res.status(200).json({users: users, reservations: reservations});

        });
    })
};
