import * as slotDb from '../db/slot';
import * as matchDb from '../db/match';
import * as topicDb from '../db/topics';
import * as notifications from '../db/notifications';
import * as users from '../db/users';
import {plugins, NodebbRequest, NodebbResponse, User} from '../../types/nodebb';
import * as logger from '../logger';
import * as _ from 'underscore';
import * as async from 'async';

const plugins = <plugins>require('../../../../src/plugins');

const noop = function () {};

function getSingleUser(currentUser: number, requestedUserid: number, callback) {
    users.getUsers(currentUser, [requestedUserid], function (err, users) {
        callback(err, users.shift());
    })
}

export function get (req: NodebbRequest, res: NodebbResponse) {
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
}

export function put(req: NodebbRequest, res) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    const uid = Number(req.body.uid);
    if (!uid) {
        return res.status(400).json({"message": "missing user id 'uid'"});
    }

    async.parallel({
        isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
        match: _.partial(matchDb.getFromDb, tid, matchid),
        currentlySlottedUser: function (next) {
            slotDb.getSlotUser(tid, matchid, slotid, function (err, slotUid) {
                if (slotUid) {
                    getSingleUser(req.uid, slotUid, next);
                } else {
                    next();
                }
            });
        },
        newUser: _.partial(getSingleUser, req.uid, uid)
    }, function (err: Error, results: any /*{isTopicAdmin: boolean, match: matchDb.MatchWrapper, currentlySlottedUser: User, newUser: User}*/) {
        if (err) {
            return res.status(500).json({message: err.message});
        }

        let isTopicAdmin = <boolean>results.isTopicAdmin;
        let match = <matchDb.MatchWrapper>results.match;
        let currentlySlottedUser = <User>results.currentlySlottedUser;
        let newUser = results.newUser;


        if (!isTopicAdmin) {
            if (currentlySlottedUser) {
                return res.status(403).json({message: "Slot is already taken!"});
            }
            if (req.uid !== uid) {
                return res.status(403).json({message: "You cant slot other users!"});
            }
        }
        if (!match) {
            return res.status(404).json({message: "match %s not found".replace("%s", matchid)});
        }

        slotDb.putSlotUser(tid, matchid, slotid, uid, function (err) {
            if (err) {
                return res.status(500).json({message: err.message});
            }
            logger.info('user put for match %s, slot %s'.replace('%s', matchid).replace('%s', slotid));
            notifications.notifySlotted(match, currentlySlottedUser, newUser);
            plugins.fireHook('action:arma3-slotting.set', {tid: tid, uid: uid, matchid: matchid}, noop);
            return res.status(204).json(null);
        });
    });
}

export function del(req: NodebbRequest, res: NodebbResponse) {
    const tid = req.params.tid;
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;


    async.parallel({
        isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
        match: _.partial(matchDb.getFromDb, tid, matchid),
        currentlySlottedUser: function (next) {
            slotDb.getSlotUser(tid, matchid, slotid, function (err, slotUid) {
                if (slotUid) {
                    getSingleUser(req.uid, slotUid, next);
                } else {
                    next();
                }
            });
        }
    }, function (err: Error, results) {
        if (err) {
            return res.status(500).json({message: err.message});
        }

        let isTopicAdmin = results.isTopicAdmin;
        let match = <matchDb.MatchWrapper>results.match;
        let currentlySlottedUser = <User>results.currentlySlottedUser;
        let currentlySlottedUserId = currentlySlottedUser && Number(currentlySlottedUser.uid);

        if ((currentlySlottedUserId !== req.uid) && !isTopicAdmin) {
            return res.status(403).json({message: "You're not allowed to unslot that user."});
        }
        if (!currentlySlottedUserId) {
            return res.status(404).json({message: "Cant delete. Nobody is slotted there."});
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
