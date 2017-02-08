"use strict";

let slotDb = require('../db/slot');
let matchDb = require('../db/match');
let topicDb = require('../db/topics');

const winston = require('winston');
const _ = require('underscore');
const async = require('async');

module.exports.get = function (req, res, next) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    slotDb.getMatchUsers(tid, matchid, function (err, result) {
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
    if (!model.uid) {
        return res.status(400).json({"message": "missing user id 'uid'"});
    }

    async.parallel({
        isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
        match: _.partial(matchDb.getFromDb, tid, matchid),
        currentlySlottedUser: _.partial(slotDb.getSlotUser, tid, matchid, slotid)
    }, function (err, results) {
        if (err) {
            return res.status(500).json({message: err.message});
        }

        let isTopicAdmin = results['isTopicAdmin'];
        let match = results['match'];
        let currentlySlottedUser = results['currentlySlottedUser'];

        if (currentlySlottedUser && !isTopicAdmin) {
            return res.status(403).json({message: "Slot is already taken!"});
        }
        if (!match) {
            return res.status(404).json({message: "match %s not found".replace("%s", matchid)});
        }

        slotDb.putSlotUser(tid, matchid, slotid, parseInt(model.uid, 10), function (err, result) {
            if (err) {
                return res.status(500).json({message: e.message});
            }
            winston.info('user put for match %s, slot %s'.replace('%s', matchid).replace('%s', slotid));
            return res.status(204).json(null);
        });
    });
};

module.exports.delete = function (req, res, next) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;


    async.parallel({
        isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
        match: _.partial(matchDb.getFromDb, tid, matchid),
        currentlySlottedUser: _.partial(slotDb.getSlotUser, tid, matchid, slotid)
    }, function (err, results) {
        if (err) {
            return res.status(500).json({message: err.message});
        }

        let isTopicAdmin = results['isTopicAdmin'];
        let match = results['match'];
        let currentlySlottedUser = results['currentlySlottedUser'];

        if ((currentlySlottedUser !== req.uid) && !isTopicAdmin) {
            return res.status(403).json({message: "You're not allowed to unslot that user."});
        }
        if (!currentlySlottedUser) {
            return res.status(404).json({message: "Cant delete. Nobody is slotted there."});
        }

        slotDb.deleteSlotUser(tid, matchid, slotid, function (err) {
            if (err) {
                return res.status(500).json(err);
            }

            return res.status(204).json(null);
        });
    });
};
