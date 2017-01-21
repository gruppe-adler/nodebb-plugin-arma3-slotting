"use strict";

const db = require('../../../../src/database');

let slotDb = require('../db/slot');

module.exports.get = function (req, res, next) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    slotDb.getMatchReservations(tid, matchid, function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }
        if (!result) {
            return res.status(404).json(null);
        }

        if (!result[slotid]) {
            return res.status(404).json(null);
        }

        return res.status(200).json(result[slotid]);
    });
};

module.exports.put = function (req, res, next) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    let model = req.body;
    if (!model['reserved-for']) {
        return res.status(400).json({"message": "missing reservation string 'reserved-for'"});
    }

    slotDb.putMatchReservation(tid, matchid, slotid, parseInt(model['reserved-for'], 10), function (err, result) {
        if (err) {
            return res.status(500).json(err);
        }
        return res.status(204).json(null);
    });
};

module.exports.delete = function (req, res, next) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    slotDb.deleteMatchReservation(tid, matchid, slotid, function (err) {
        if (err) {
            return res.status(500).json(err);
        }

        return res.status(204).json(null);
    });
};
