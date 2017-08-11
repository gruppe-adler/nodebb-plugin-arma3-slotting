"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var slotDb = require("../db/slot");
var matchDb = require("../db/match");
var topicDb = require("../db/topics");
var notifications = require("../db/notifications");
var users = require("../db/users");
var logger = require("../logger");
var _ = require("underscore");
var async = require("async");
var plugins = require('../../../../src/plugins');
var noop = function () { };
function getSingleUser(currentUser, requestedUserid, callback) {
    users.getUsers(currentUser, [requestedUserid], function (err, users) {
        callback(err, users.shift());
    });
}
function get(req, res) {
    var tid = req.params.tid;
    var matchid = req.params.matchid;
    var slotid = req.params.slotid;
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
}
exports.get = get;
function put(req, res) {
    var tid = req.params.tid;
    var matchid = req.params.matchid;
    var slotid = req.params.slotid;
    var uid = Number(req.body.uid);
    if (!uid) {
        return res.status(400).json({ "message": "missing user id 'uid'" });
    }
    async.parallel({
        isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
        match: _.partial(matchDb.getFromDb, tid, matchid),
        currentlySlottedUser: function (next) {
            slotDb.getSlotUser(tid, matchid, slotid, function (err, slotUid) {
                if (slotUid) {
                    getSingleUser(req.uid, slotUid, next);
                }
                else {
                    next();
                }
            });
        },
        newUser: _.partial(getSingleUser, req.uid, uid)
    }, function (err, results /*{isTopicAdmin: boolean, match: matchDb.MatchWrapper, currentlySlottedUser: User, newUser: User}*/) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        var isTopicAdmin = results.isTopicAdmin;
        var match = results.match;
        var currentlySlottedUser = results.currentlySlottedUser;
        var newUser = results.newUser;
        if (!isTopicAdmin) {
            if (currentlySlottedUser) {
                return res.status(403).json({ message: "Slot is already taken!" });
            }
            if (req.uid !== uid) {
                return res.status(403).json({ message: "You cant slot other users!" });
            }
        }
        if (!match) {
            return res.status(404).json({ message: "match %s not found".replace("%s", matchid) });
        }
        slotDb.putSlotUser(tid, matchid, slotid, uid, function (err) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            logger.info('user put for match %s, slot %s'.replace('%s', matchid).replace('%s', slotid));
            notifications.notifySlotted(match, currentlySlottedUser, newUser);
            plugins.fireHook('action:arma3-slotting.set', { tid: tid, uid: uid, matchid: matchid }, noop);
            return res.status(204).json(null);
        });
    });
}
exports.put = put;
function del(req, res) {
    var tid = req.params.tid;
    var matchid = req.params.matchid;
    var slotid = req.params.slotid;
    async.parallel({
        isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
        match: _.partial(matchDb.getFromDb, tid, matchid),
        currentlySlottedUser: function (next) {
            slotDb.getSlotUser(tid, matchid, slotid, function (err, slotUid) {
                if (slotUid) {
                    getSingleUser(req.uid, slotUid, next);
                }
                else {
                    next();
                }
            });
        }
    }, function (err, results) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        var isTopicAdmin = results.isTopicAdmin;
        var match = results.match;
        var currentlySlottedUser = results.currentlySlottedUser;
        var currentlySlottedUserId = currentlySlottedUser && Number(currentlySlottedUser.uid);
        if ((currentlySlottedUserId !== req.uid) && !isTopicAdmin) {
            return res.status(403).json({ message: "You're not allowed to unslot that user." });
        }
        if (!currentlySlottedUserId) {
            return res.status(404).json({ message: "Cant delete. Nobody is slotted there." });
        }
        slotDb.deleteSlotUser(tid, matchid, slotid, function (err) {
            if (err) {
                return res.status(500).json(err);
            }
            notifications.notifyUnslotted(match, currentlySlottedUser);
            return res.status(204).json(null);
        });
    });
}
exports.del = del;
