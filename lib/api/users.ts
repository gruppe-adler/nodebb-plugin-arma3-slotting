import {noop} from "../fn";

import * as async from "async";
import * as _ from "underscore";
import {INodebbRequest, INodebbResponse, IPlugins, IUser} from "../../types/nodebb";
import * as matchDb from "../db/match";
import * as matchApi from './match';
import * as notifications from "../db/notifications";
import * as slotDb from "../db/slot";
import * as topicDb from "../db/topics";
import * as shareDb from "../db/share";
import * as users from "../db/users";
import * as logger from "../logger";
import { IMatchOutputUser, Match } from '../match';
const socketio = require.main.require('./src/socket.io');
const websocket = socketio.server.of('/slotting');

const plugins = require("../../../../src/plugins") as IPlugins;

function getSingleUser(currentUser: number, requestedUserid: number, callback) {
    users.getUsers(currentUser, [requestedUserid], function (err, resultUsers) {
        callback(err, resultUsers.shift());
    });
}

export function get(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
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

export function put(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid: string = req.params.matchid;
    const slotid: string = req.params.slotid;

    if (req.body.shareKey) {
        return putExtern(req, res);
    }

    const uid = Number(req.body.uid);
    if (!uid) {
        return res.status(400).json({message: "missing user id 'uid'"});
    }

    async.parallel(
        {
            isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
            match: _.partial(matchDb.getFromDb, tid, matchid),
            currentlySlottedUser(next) {
                slotDb.getSlotUser(tid, matchid, slotid, function (err: Error, slotUid: number) {
                    if (slotUid) {
                        getSingleUser(req.uid, slotUid, next);
                    } else {
                        next();
                    }
                });
            },
            newUser: _.partial(getSingleUser, req.uid, uid),
        } as any,
        /*{isTopicAdmin: boolean, match: matchDb.MatchWrapper, currentlySlottedUser: User, newUser: User}*/
        function (err: Error, results: any) {
        if (err) {
            return res.status(500).json({message: err.message});
        }

        const isTopicAdmin = results.isTopicAdmin as boolean;
        const match = results.match as Match;
        const currentlySlottedUser = results.currentlySlottedUser as IUser;
        const newUser = results.newUser;

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

        slotDb.putSlotUser(tid, matchid, slotid, uid, function (error: Error) {
            if (error) {
                return res.status(500).json({message: error.message});
            }
            logger.info("user put for match %s, slot %s".replace("%s", matchid).replace("%s", slotid));
            notifications.notifySlotted({match, tid}, currentlySlottedUser, newUser);
            plugins.fireHook("action:arma3-slotting.set", {tid, uid, matchid}, noop);

            websocket.emit('event:user-slotted', {
                tid: tid,
                matchid: matchid,
                slot: slotid,
                user: newUser
            });

            return res.status(204).json(null);
        });
    });
}

export function putExtern(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid: string = req.params.matchid;
    const slotid: string = req.params.slotid;
    const shareid = req.body.shareKey;
    const reservation = req.body.reservation;
    const username = req.body.username;

    async.parallel(
            {
                match: _.partial(matchDb.getFromDb, tid, matchid),
                currentlySlottedUser(next) {
                    slotDb.getSlotUser(tid, matchid, slotid, function (err: Error, slotUid: number) {
                        if (slotUid) {
                            getSingleUser(req.uid, slotUid, next);
                        } else {
                            next();
                        }
                    });
                },
                shareStatus: _.partial(shareDb.isValidShare, tid, matchid, shareid)
            } as any,
            /*{isTopicAdmin: boolean, match: matchDb.MatchWrapper, currentlySlottedUser: User, newUser: User}*/
            function (err: Error, results: any) {
                if (err) {
                    return res.status(500).json({message: err.message});
                }

                const match = results.match as Match;
                const currentlySlottedUser = results.currentlySlottedUser;
                const shareStatus = results.shareStatus as string;

                if (shareStatus === "user") {
                    if (currentlySlottedUser) {
                        return res.status(403).json({message: "Slot is already taken!"});
                    }
                }
                if (!match) {
                    return res.status(404).json({message: "match %s not found".replace("%s", matchid)});
                }

                slotDb.putSlotExternUser(tid, matchid, slotid, reservation + ":" + username, function (error: Error) {
                    if (error) {
                        return res.status(500).json({message: error.message});
                    }
                    logger.info("user put for match %s, slot %s".replace("%s", matchid).replace("%s", slotid));
                    notifications.notifySlottedExternal({match, tid}, currentlySlottedUser, '[' + reservation + '] ' + username);
                    plugins.fireHook("action:arma3-slotting.setExternal", {tid, username, reservation, matchid}, noop);

                    websocket.emit('event:user-slotted', {
                        tid: tid,
                        matchid: matchid,
                        slot: slotid,
                        user: <IMatchOutputUser>{
                            uid: -1,
                            username: username,
                            userslug: username,
                            picture: "",
                            "icon:bgColor": "#673ab7",
                            "icon:text": reservation,
                            groupTitle: "",
                            groups: []
                        }
                    });

                    return res.status(204).json();
                });
            });
}

export function del(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;

    if (req.body.shareKey) {
        return delExtern(req, res);
    }

    async.parallel({
        isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
        match: _.partial(matchDb.getFromDb, tid, matchid),
        currentlySlottedUser(next) {
            slotDb.getSlotUser(tid, matchid, slotid, function (err, slotUid) {
                if (slotUid) {
                    getSingleUser(req.uid, slotUid, next);
                } else {
                    next();
                }
            });
        },
    }, function (err: Error, results) {
        if (err) {
            return res.status(500).json({message: err.message});
        }

        const isTopicAdmin = results.isTopicAdmin;
        const match = results.match as Match;
        const currentlySlottedUser = results.currentlySlottedUser as IUser;
        const currentlySlottedUserId = currentlySlottedUser && Number(currentlySlottedUser.uid);

        if ((currentlySlottedUserId !== req.uid) && !isTopicAdmin) {
            return res.status(403).json({message: "You're not allowed to unslot that user."});
        }

        // If there is nobody slotted, just ignore it
        /*
        if (!currentlySlottedUserId) {
            return res.status(404).json({message: "Cant delete. Nobody is slotted there."});
        }*/

        slotDb.deleteSlotUser(tid, matchid, slotid, function (error: Error) {
            if (error) {
                return res.status(500).json(error);
            }

            notifications.notifyUnslotted({match, tid}, currentlySlottedUser);

            websocket.emit('event:user-unslotted', {
                tid: tid,
                matchid: matchid,
                slot: slotid
            });

            return res.status(204).json(null);
        });
    });
}

export function delExtern(req: INodebbRequest, res: INodebbResponse) {
    const tid: number = Number(req.params.tid);
    const matchid = req.params.matchid;
    const slotid = req.params.slotid;
    const shareid = req.body.shareKey;
    const reservation = req.body.reservation;
    const username = req.body.username;

    async.parallel({
        isTopicAdmin: _.partial(topicDb.isAllowedToEdit, req.uid, tid),
        match: _.partial(matchDb.getFromDb, tid, matchid),
        shareStatus: _.partial(shareDb.isValidShare, tid, matchid, shareid),
        currentlySlottedUser(next) {
            slotDb.getSlotUser(tid, matchid, slotid, function (err, slotUid) {
                if (slotUid && typeof slotUid !== typeof '') {
                    getSingleUser(req.uid, slotUid, next);
                } else {
                    next(null, slotUid);
                }
            });
        },
    }, function (err: Error, results) {
        if (err) {
            return res.status(500).json({message: err.message});
        }

        const shareStatus = results.shareStatus;
        const match = results.match as Match;
        const currentlySlottedUser = results.currentlySlottedUser;

        if (shareStatus === "none") {
            logger.info('invalid share');
            return res.status(401).json();
        }

        if (typeof currentlySlottedUser !== typeof '') {
            logger.info('wanted to unslot forum user with share key')
            return res.status(401).json();
        }

        // If there is nobody slotted, just ignore it
        /*
        if (!currentlySlottedUserId) {
            return res.status(404).json({message: "Cant delete. Nobody is slotted there."});
        }*/

        slotDb.deleteSlotUser(tid, matchid, slotid, function (error: Error) {
            if (error) {
                return res.status(500).json(error);
            }

            websocket.emit('event:user-unslotted', {
                tid: tid,
                matchid: matchid,
                slot: slotid
            });

            notifications.notifyUnslottedExternal({match, tid}, '[' + reservation + '] ' + username);
            return res.status(204).json();
        });
    });
}
